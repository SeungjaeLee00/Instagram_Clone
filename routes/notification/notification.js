const express = require("express");
const router = express.Router();
const { Notification } = require("../../models/Notification"); // 알림 모델
const { auth } = require("../auth");

const cookieParser = require('cookie-parser');
router.use(cookieParser());

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
      const filteredNotifications = notifications.filter(notification => {
        // 본인의 댓글이나 게시물에 대한 알람이어야 함
        return notification.other_object_id.toString() != notification.object_id.toString() 
        && notification.object_id.toString() == userId.toString();
      });

      return res.status(200).json(filteredNotifications);
    } catch (error) {
      return res.status(500).json({ message: "알림을 가져오는 중 오류가 발생했습니다.", error: error.message });
    }
  });
  

module.exports = router;
