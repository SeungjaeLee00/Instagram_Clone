const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { Chatroom } = require("../../models/Chatroom");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "DM (Direct Message)"
 *     description: "1:1 메시지 관련 API"
 * /dm/chatroom/delete/{chatroomId}:
 *   delete:
 *     description: "채팅방을 삭제하는 API (로그인된 사용자만)"
 * tags:
 *       - "DM (Direct Message)"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: "chatroomId"
 *         in: "path"
 *         required: true
 *         description: "삭제할 채팅방의 ID"
 *         schema:
 *           type: string
 *           example: "60b8d6c3f07f6f3b4d455777"
 *     responses:
 *       200:
 *         description: "채팅방이 삭제되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "채팅방이 삭제되었습니다."
 *       403:
 *         description: "채팅방에 대한 권한이 없습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "이 채팅방에 대한 권한이 없습니다."
 *       404:
 *         description: "채팅방을 찾을 수 없습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "채팅방을 찾을 수 없습니다."
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
 *                 error:
 *                   type: string
 *                   example: "채팅방 삭제 실패"
 *                 message:
 *                   type: string
 *                   example: "Error message here"
 */

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
