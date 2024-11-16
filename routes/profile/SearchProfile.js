const express = require("express");
const router = express.Router();

const { Post } = require("../../models/Post");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// auth에서 로그인 쿠키 인증된 경우만 프로필 수정 가능
// 사용자 로그인 상태 확인
router.get('/', auth, (req, res) => {
    Post.findOne({user: req.user._id})
    .then((result) => {
        return res.status(200).json({
            images: result.images
        });
    })
    .catch ((err) => {
        res.status(500).json({ message: err });
    });
});

module.exports = router;
