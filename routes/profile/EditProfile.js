const express = require("express");
const router = express.Router();
router.use(express.json());

const { User } = require("../../models/User");
const {auth} = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const multer = require('multer');
const path = require('path')

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, 'uploads/');
    },
    filename: (req, file, done) => {
      const ext = path.extname(file.originalname);
      const filename = path.basename(file.originalname, ext) + Date.now() + ext;
      done(null, filename);
    }
  }),
});

// 사용자 정보 수정(이름, 회원id, 자기소개)
router.patch('/', auth, upload.single('file'), (req, res) => {
  const { new_name, new_user_id, new_introduce } = req.body;

  User.findById(req.user._id)
  .then((user)=>{
    if(!user) return res.status(404).json({ 
        message: '사용자를 찾을 수 없습니다.'
    });

    // 이름, 회원 id, 자기소개 업데이트
    user.name = new_name || user.name;
    user.user_id = new_user_id || user.user_id;
    user.introduce = new_introduce || user.introduce;

    // 파일 있을 경우 경로 저장
    if (req.file) {
      const imagePath = req.file.path;
      user.image = imagePath;
    }

    user.save()
    .then(() => {
      return res.json({ 
        message: '정보가 수정되었습니다.' 
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: '정보 저장 중 오류가 발생했습니다.',
        error: err.message
      });
    });  
  }) 
  .catch ((err) => {
    return res.status(500).json({ 
        message: '서버 오류' 
    });
  });
});

module.exports = router;