const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { User } = require("../../models/User");
const { Chatroom } = require("../../models/Chatroom");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 채팅방이 없는 경우 만들기
router.post("/:chatId", auth, async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;
  // console.log("chatId", chatId);
  // const { title } = req.body;

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "유효하지 않은 chatId" });
  }

  try {
    // 상대방 찾기
    // console.log("상대방 찾기 chatId:", chatId);
    const targetUser = await User.findOne({ user_id: chatId }).lean();
    if (!targetUser) {
      return res.status(404).json({
        error: "채팅 상대를 찾을 수 없습니다.",
      });
    }

    // 기존 채팅방 확인
    const existChatroom = await Chatroom.findOne({
      members: { $all: [userId, targetUser._id] },
    }).lean();

    if (existChatroom) {
      return res.status(200).json({
        message: "이미 채팅방이 있습니다.",
        chatroomId: existChatroom._id,
        chatroomName: targetUser.user_id,
        user_object_id: userId, // 요청한 사용자의 _id
      });
    }

    // 새 채팅방 생성
    const savedata = {
      members: [userId, targetUser._id],
      date: new Date(),
      title: targetUser.user_id,
    };

    const chatroom = new Chatroom(savedata);
    const result = await chatroom.save();

    res.status(201).json({
      message: "채팅방 저장 완료",
      chatroomId: result._id,
      chatroomName: result.title,
      user_object_id: userId,
    });
  } catch (error) {
    console.error("Error creating chatroom:", error);
    res.status(500).json({
      error: "채팅방 저장 실패",
      message: error.message,
    });
  }
});

module.exports = router;
