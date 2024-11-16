const express = require("express");
const router = require("express").Router();
router.use(express.json());

const {auth} = require("../auth");
const {Message} = require("../../models/Message");
const {Chatroom} = require("../../models/Chatroom");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const path = require("path");
const { User } = require("../../models/User");

const messageInit = (io, socket, p_chatroomId) => {
    const userId = socket.handshake.query.user_id;
    const chatroomId = p_chatroomId;  // 실제 채팅방 ID로 수정

    console.log("User ID: ", userId); // 사용자 ID 확인
    
    User.findOne({user_id: userId})
    .then ((user) => {
        if(!user) {
            socket.emit("error", {message: "유저를 찾을 수 없습니다."})
            socket.disconnect();
            return;
        }

        const objectId = user._id.toString();

        socket.emit("userObjectId", objectId);

        // 채팅방 멤버 확인
        checkIfUserInChatroom(chatroomId, objectId)
        .then(isMember => {
            if (!isMember) {
                console.log(`User ${userId} is not a member of chatroom ${chatroomId}`);
                socket.emit("error", { message: "You are not a member of this chatroom." });
                socket.disconnect(); // 채팅방 멤버가 아니면 연결 종료
                return;
            }

            // 클라이언트가 채팅방에 들어갈 때 이전 메시지 전송
            getMessages(chatroomId).then((messages) => {
                socket.emit("previousMessages", messages);
            });

            //실시간 메세지 전송 처리
            //프론트(index.html)로 부터 content를 전달받음
            socket.on("sendMessage", async(content) => {
                try{
                    const message = new Message({
                        chatroom: chatroomId,
                        content: content,
                        object_id: objectId,
                        user_id: userId,
                        date: new Date(),
                    });

                    const saveMessage = await message.save();

                    //채팅방에 메세지 전송
                    //html의 newMessage에서 받아서 처리
                    io.to(chatroomId).emit("newMessage", saveMessage);
                    console.log(saveMessage);                   
                } catch(err) {
                    console.error("Message saving failed: ", err);
                    socket.emit("error", { message: "메시지 저장 중 오류가 발생했습니다." });
                }
            });

            // 메시지 삭제 처리
            socket.on("deleteMessage", async({ messageId }) => {
                try {
                    // 메시지가 해당 채팅방에 속하는지 확인
                    const message = await Message.findById(messageId);
                    if (message.chatroom.toString() !== chatroomId) {
                        return socket.emit("error", { message: "Message not found in this chatroom." });
                    }

                    // 메시지 삭제
                    await Message.findByIdAndDelete(messageId);

                    // 삭제된 메시지를 채팅방에 전달
                    io.to(chatroomId).emit("messageDeleted", messageId);
                    console.log(`Message ${messageId} deleted`);
                } catch (err) {
                    console.error("Message deletion failed: ", err);
                    socket.emit("error", { message: "메시지 삭제 중 오류가 발생했습니다." });
                };
            });

        });
    });
}

// 이전 메시지들을 가져오는 함수
const getMessages = (chatroomId) => {
    return Message.find({ chatroom: chatroomId })
        .sort({ date: 1 }) // 날짜 기준으로 오름차순 정렬
        .limit(50); // 최대 50개 메시지 가져오기
};

// 채팅방 멤버인지 확인하는 함수
const checkIfUserInChatroom = (chatroomId, objectId) => {
    return new Promise((resolve, reject) => {
        Chatroom.findOne({ _id: chatroomId, members: objectId })
            .then(chatroom => {
                if (chatroom) {
                    resolve(true);  // 사용자가 멤버일 경우
                } else {
                    resolve(false);  // 사용자가 멤버가 아닐 경우
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

// auth 부분 제외 -> 나중에 추가해야 함
router.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "index.html"));
})


// postman
// 채팅방 내용 불러오기
router.get("/:chatroomId", auth, (req, res) => {
    const chatroomId = req.params.chatroomId;

    Chatroom.findOne({
        _id: chatroomId, members: req.user._id
    })
    .then((result) => {
        if(!result){
            return res.json({
                message: "해당 채팅방의 멤버가 아닙니다."
            });
        };
        // 채팅방의 chatroomId로 Message에서 메세지 가져오기
        Message.find({
            chatroom: result._id
        })
        .sort({date:1}) // 과거순으로
        .then((result) => {
            const messages = result.map((message) => `${message.user_id}: ${message.content}`);
            
            console.log(messages);

            return res.json({
                message: "채팅 내용 불러오기 성공",
                chats : messages
            }); 
        });
    })
    .catch((error) => {
        return res.status(500).json({
            message: "채팅 내역을 찾을 수 없습니다.",
            error: error
        });
    });
});

// 메세지 삭제
// 해당하는 messageId db에서 삭제
router.delete("/:messageId", auth, async(req, res) => {
    const {messageId} = req.params;
    const userId = req.user._id;
    console.log(userId);

    try{
        // 메세지 정보
        const message = await Message.findById(messageId);

        if(!message) {
            return res.status(404)
                .json({
                    error: "메세지를 찾을 수 없습니다"
                });
        }

        // 사용자 검증
        const chatroom = await Chatroom.findOne({_id:message.chatroom, members: userId});
        if(!chatroom){
            return res.status(403)
                .json({
                    error: "해당 채팅방에 권한이 없습니다."
                });
        }

        await Message.findByIdAndDelete(messageId);

        return res.status(200)
            .json({
                message: "메세지가 삭제되었습니다."
            })
    } catch (error) {
        return res.status(500)
        .json({
            error: error
        });
    }
})

module.exports = {messageInit, router};