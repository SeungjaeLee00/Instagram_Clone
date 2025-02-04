const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { Notification } = require("../../models/Notification");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Notifications"
 *     description: "알림 관련 API"
 * /notifications/delete/{notificationId}:
 *   delete:
 *     description: "사용자가 받은 알림을 삭제하는 API (로그인된 사용자만)"
 * tags:
 *       - "Notifications"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: notificationId
 *         in: path
 *         required: true
 *         description: "삭제할 알림의 ID"
 *         schema:
 *           type: string
 *           example: "60e5b0f5b1f16b001c9a8f7a"
 *     responses:
 *       200:
 *         description: "알림 삭제 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림이 삭제되었습니다."
 *       400:
 *         description: "잘못된 요청"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림을 찾을 수 없습니다."
 *       403:
 *         description: "권한 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림을 삭제할 권한이 없습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림 삭제 중 오류가 발생했습니다."
 */

// 알림 삭제
router.delete("/:notificationId", auth, async (req, res) => {
  const notificationId = req.params.notificationId; // 경로 매개변수에서 notificationId 가져오기
  const userId = req.user._id; // 로그인된 사용자 ID

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "알림을 찾을 수 없습니다." });
    }

    // 알림 대상자가 맞는지 확인
    if (notification.object_id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "알림을 삭제할 권한이 없습니다." });
    }

    // 알림 삭제
    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json({
      message: "알림이 삭제되었습니다.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "알림 삭제 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
