const express = require("express");
const router = express.Router();
router.use(express.json());

const { User } = require("../../models/User");
const {auth} = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());


// 사용자 정보 수정(이름, 회원id)
router.patch('/', auth, (req, res) => {
  const { new_name, new_user_id } = req.body;

  User.findById(req.user._id)
  .then((user)=>{
    if(!user) return res.status(404).json({ 
        message: '사용자를 찾을 수 없습니다.'
    });

    user.name = new_name || user.name;
    user.user_id = new_user_id || user.user_id;

    user.save();
    return res.json({ 
        message: '정보가 수정되었습니다.' 
    });
  }) 
  .catch ((err) => {
    return res.status(500).json({ 
        message: '서버 오류' 
    });
  });
});

module.exports = router;