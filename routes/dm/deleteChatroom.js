const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { Chatroom } = require("../../models/Chatroom");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 채팅방 삭제
router.delete("/:chatroomId", auth, async (req, res) => {
  const userId = req.user._id;
  const chatroomId = req.params.chatroomId;

  try {
    // 채팅방 확인
    const chatroom = await Chatroom.findOne({ _id: chatroomId });

    if (!chatroom) {
      return res.status(404).json({
        error: "채팅방을 찾을 수 없습니다.",
      });
    }

    // 사용자가 채팅방의 멤버인지 확인
    if (!chatroom.members.includes(userId)) {
      return res.status(403).json({
        error: "이 채팅방에 대한 권한이 없습니다.",
      });
    }

    // 채팅방 삭제
    await Chatroom.deleteOne({ _id: chatroomId });

    res.status(200).json({
      message: "채팅방이 삭제되었습니다.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "채팅방 삭제 실패",
      message: error.message,
    });
  }
});

module.exports = router;
