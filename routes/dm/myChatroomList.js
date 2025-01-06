const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { User } = require("../../models/User");
const { Chatroom } = require("../../models/Chatroom");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 내가 속한 모든 채팅방 가져오기
router.get("/", auth, (req, res) => {
  Chatroom.find({ members: req.user._id })
    .populate("members", "user_id") // 'members' 배열에 있는 사용자 정보 중 user_id만 가져오기
    .then((chatrooms) => {
      if (!chatrooms || chatrooms.length === 0) {
        return res.json({
          message: "채팅방이 없습니다.",
        });
      }

      const chatroomData = chatrooms
        .map((chatroom) => {
          if (!chatroom.members || chatroom.members.length === 0) {
            return null;
          }

          const otherUser = chatroom.members.find(
            (member) => member._id.toString() !== req.user._id.toString()
          );

          const chatroomName = otherUser ? otherUser.user_id : "Unknown";

          return {
            chatroomId: chatroom._id,
            chatroomName: chatroomName,
          };
        })
        .filter((data) => data !== null);

      res.json({
        message: "참여 중인 채팅방 목록",
        chatrooms: chatroomData,
        user_id: req.user._id,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "채팅방 조회 실패",
        error: error.message,
      });
    });
});

module.exports = router;
