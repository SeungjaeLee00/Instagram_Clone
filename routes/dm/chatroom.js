// 임시
const express = require("express");
const router = require("express").Router();
router.use(express.json());
const {auth} = require("../auth");

const {Chatroom} = require("../../models/Chatroom");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 내가 속해 있는 모든 채팅방 가져오기
router.get("/", auth, (req, res) => {
    Chatroom.find(
        {members : req.user._id}
    )
    .then((chatrooms) => {
        const titles = chatrooms.map(chatroom => chatroom.title);

        if(chatrooms) {
            res.json({
                message: "참여 중인 채팅방 목록",
                chatrooms: titles
            });
        } else{
            res.json({
                message: "채팅방이 없습니다."
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: "채팅방 조회 실패",
            error : error
        })
    })
});

// 채팅방이 없는 경우 만들기
// :chatId => 채팅하고 싶은 상대의 _id
router.post("/:chatId", auth, (res, req) => {
    const userId = req.user._id;
    const chatId = req.params._id;

    const chatroom = new Chatroom({
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
})

module.exports = router ;