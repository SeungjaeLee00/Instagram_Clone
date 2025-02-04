const express = require("express");
const router = express.Router();
const { Notification } = require("../../models/Notification"); // 알림 모델
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Notifications"
 *     description: "알림 관련 API"
 * /notifications/:
 *   get:
 *     description: "사용자에게 해당하는 알림을 가져오는 API (로그인된 사용자만)"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "알림 목록 반환"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   notification_id:
 *                     type: string
 *                     example: "60e5b0f5b1f16b001c9a8f7a"
 *                   object_id:
 *                     type: string
 *                     example: "60e5b0f5b1f16b001c9a8f7b"
 *                   other_object_id:
 *                     type: string
 *                     example: "60e5b0f5b1f16b001c9a8f7c"
 *                   message:
 *                     type: string
 *                     example: "사용자가 댓글을 좋아합니다."
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-04T10:00:00Z"
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림을 가져오는 중 오류가 발생했습니다."
 */

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ object_id: userId })
      .sort({ date: -1 })
      .limit(50);

    // 필터링
    // 본인 게시물에 작성한 다른 사람의 댓글에 대한 알림
    // 다른 사람의 댓글에 좋아요
    // 다른 사람의 게시글에 좋아요
    const filteredNotifications = notifications.filter((notification) => {
      // 본인의 댓글이나 게시물에 대한 알람이어야 함
      return (
        notification.other_object_id.toString() !=
          notification.object_id.toString() &&
        notification.object_id.toString() == userId.toString()
      );
    });

    return res.status(200).json(filteredNotifications);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "알림을 가져오는 중 오류가 발생했습니다.",
        error: error.message,
      });
  }
});

module.exports = router;
