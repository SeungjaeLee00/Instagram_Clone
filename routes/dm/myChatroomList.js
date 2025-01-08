const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { User } = require("../../models/User");
const { Chatroom } = require("../../models/Chatroom");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 내가 속한 모든 채팅방 가져오기
router.get("/", auth, async (req, res) => {
  try {
    const chatrooms = await Chatroom.find({ members: req.user._id }).populate(
      "members",
      "user_id"
    ); // 'members' 배열에 있는 사용자 정보 중 user_id만 가져오기

    if (!chatrooms || chatrooms.length === 0) {
      return res.json({
        message: "채팅방이 없습니다.",
      });
    }

    const chatroomData = await Promise.all(
      chatrooms.map(async (chatroom) => {
        if (!chatroom.members || chatroom.members.length === 0) {
          return null;
        }

        const otherUser = chatroom.members.find(
          (member) => member._id.toString() !== req.user._id.toString()
        );

        if (!otherUser) {
          return null;
        }

        // 상대방의 프로필 이미지 가져오기
        const otherUserProfile = await User.findById(otherUser._id).select(
          "profile_image"
        );

        const chatroomName = otherUser ? otherUser.user_id : "Unknown";

        return {
          chatroomId: chatroom._id,
          chatroomName: chatroomName,
          user_profile: otherUserProfile ? otherUserProfile.profile_image : null,
        };
      })
    );

    const filteredChatroomData = chatroomData.filter((data) => data !== null);

    res.json({
      message: "참여 중인 채팅방 목록",
      chatrooms: filteredChatroomData,
      user_id: req.user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "채팅방 조회 실패",
      error: error.message,
    });
  }
});

module.exports = router;
