const express = require("express");
const router = express.Router();

const { User } = require("../../models/User");
const {auth} = require("../auth");

// auth에서 로그인 쿠키 인증된 경우만 프로필 수정 가능
// 사용자 로그인 상태 확인
// router.get('/check', auth, (req, res) => {
//     User.findOne({_id: req.user._id})
//     .then(() => {
//         return res.status(200).json({
//             SearchUser: true
//         });
//     })
//     .catch ((err) => {
//         res.status(500).json({ message: '서버 오류' });
//     });

//     console.log(req.user._id);
// })
