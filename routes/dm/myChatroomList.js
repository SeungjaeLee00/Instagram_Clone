const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { User } = require("../../models/User");
const { Chatroom } = require("../../models/Chatroom");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "DM (Direct Message)"
 *     description: "1:1 메시지 관련 API"
 * /dm/list:
 *   get:
 *     description: "사용자가 속한 모든 채팅방 목록을 조회하는 API (로그인된 사용자만)"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "참여 중인 채팅방 목록"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "참여 중인 채팅방 목록"
 *                 chatrooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chatroomId:
 *                         type: string
 *                         example: "60b8d6c3f07f6f3b4d455777"
 *                       chatroomName:
 *                         type: string
 *                         example: "seungjae"
 *                       user_profile:
 *                         type: string
 *                         example: "https://example.com/profile.jpg"
 *                 user_id:
 *                   type: string
 *                   example: "60b8d6c3f07f6f3b4d455777"
 *                 userName:
 *                   type: string
 *                   example: "seungjae"
 *       401:
 *         description: "인증되지 않은 사용자. 로그인 후 다시 시도하세요."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인 후 다시 시도해주세요."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "채팅방 조회 실패"
 *                 error:
 *                   type: string
 *                   example: "Error message here"
 */

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
        user_id: req.user._id,
        userName: req.user.user_id,
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
          user_profile: otherUserProfile
            ? otherUserProfile.profile_image
            : null,
        };
      })
    );

    const filteredChatroomData = chatroomData.filter((data) => data !== null);

    res.json({
      message: "참여 중인 채팅방 목록",
      chatrooms: filteredChatroomData,
      user_id: req.user._id,
      userName: req.user.user_id,
    });
  } catch (error) {
    res.status(500).json({
      message: "채팅방 조회 실패",
      error: error.message,
    });
  }
});

module.exports = router;
