const express = require("express");
const router = require("express").Router();
router.use(express.json());

const { auth } = require("../auth");
const { Notification } = require("../../models/Notification");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 알림 삭제
router.delete("/:notificationId", auth, async (req, res) => {
    const notificationId = req.params.notificationId; // 경로 매개변수에서 notificationId 가져오기
    const userId = req.user._id; // 로그인된 사용자 ID

    try{
        const notification = await Notification.findById(notificationId);
        if(!notification){
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
    } catch(error){
        return res.status(500).json({
            message: "알림 삭제 중 오류가 발생했습니다.",
            error: error.message,
        });
    }
    
});

module.exports = router;
