const express = require("express");
const router = require("express").Router();
router.use(express.json());

const {auth} = require("../auth");
const {Message} = require("../../models/Message");
const {Chatroom} = require("../../models/Chatroom");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 채팅방 내용 불러오기
router.get("/:chatroomId", auth, (req, res) => {
    const chatroomId = req.params.chatroomId;

    Message.find({
        chatroom: chatroomId, user_id: req.user._id
    })
    .sort({date:1}) // 과거순으로
    .then((result) => {
        const messages = result.map(message => message.content);

        return res.json({
            message: "채팅 내용 불러오기 성공",
            chats : messages
        });                       
    })
    .catch((error) => {
        return res.status(500).json({
            message: "채팅 내역을 찾을 수 없습니다.",
            error: error
        });
    });
});

// 채팅메시지 보내기
router.post("/send", auth, (req, res) => {
    const content = req.body.content;
    const chatId = req.body.chat_id;
    const title = req.body.title;
    const userId = req.user._id;  

    // 채팅방 확인
    Chatroom.findOne({
        members: {$all: [userId, chatId]}
    })
    .then((chatroom) => {
        // 채팅방 없으면 새로 생성
        if (!chatroom){
            chatroom = new Chatroom({
                members: [userId, chatId],
                date: new Date(),
                title: title
            })

            chatroom.save()
            .then((result) => {
                console.log({
                    message: "채팅방 저장 완료",
                    title: result.title,
                    members : result.members,
                    Date : result.date
                });
            })
            .catch((error) => {
                return res.status(500).json({ 
                    error: "채팅방 저장 실패",
                    Message: error 
                });
            });
        }

        const message = new Message({
            chatroom: chatroom._id,
            content: content,
            user_id: userId,
            date: new Date(),
            title: chatroom.title
        });

        message.save()
        .then((result) => {
            console.log(result);

            return res.json({
                message: "메시지 전송 완료",
                title: result.title,
                chatroom: result._id,
                chatMessage: content,
            });
        })
        .catch((error) => {
            return res.json({
                message: "메시지 전송 실패",
                error: error
            });
        });
    })
    .catch((error) => {
        return res.json({
            message: "채팅방 찾기 오류",
            error: error
        });
    });
});

module.exports = router ;
