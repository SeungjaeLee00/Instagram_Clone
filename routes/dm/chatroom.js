// 임시
const express = require("express");
const router = require("express").Router();
router.use(express.json());
const { auth } = require("../auth");

const { Chatroom } = require("../../models/Chatroom");
const cookieParser = require("cookie-parser");
const { User } = require("../../models/User");
router.use(cookieParser());

// 내가 속해 있는 모든 채팅방 가져오기
router.get("/", auth, (req, res) => {
  Chatroom.find({ members: req.user._id })
    .then((chatrooms) => {
      const titles = chatrooms.map((chatroom) => chatroom.title);

      if (chatrooms) {
        res.json({
          message: "참여 중인 채팅방 목록",
          chatrooms: titles,
        });
      } else {
        res.json({
          message: "채팅방이 없습니다.",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "채팅방 조회 실패",
        error: error,
      });
    });
});

// 채팅방이 없는 경우 만들기
// :chatId => 채팅하고 싶은 상대의 _id
router.post("/:chatId", auth, async(req, res) => {
    const userId = req.user._id;
    const chatId = req.params.chatId;

    const { title } = req.body;

    try{
        const targetId = await User.findOne({ user_id: chatId});
        if(!targetId) {
            return res.status(404)
            .json({
                error: "채팅 상대를 찾을 수 없습니다."
            })
        }

        // 기존 채팅방 확인
        const existChatroom = await Chatroom.findOne({
            members: {$all: [userId, targetId]}
        })

        if(existChatroom){
            return res.status(200).json({
                message: "이미 채팅방이 있습니다.",
                chatroomId: existChatroom._id,
                title: existChatroom.title
            });
        }

        const savedata = {
            members: [userId, targetId],
            date: new Date(),
        }

        // 타이틀이 있는경우
        if(title) {
            savedata.title = title
        }

        const chatroom = new Chatroom(savedata)
        const result = await chatroom.save();

        res.status(201).json({
            message: "채팅방 저장 완료",
            title: result.title || null,
            members: result.members,
            date: result.date,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({ 
            error: "채팅방 저장 실패",
            Message: error 
        });
    }
});

module.exports = router;
