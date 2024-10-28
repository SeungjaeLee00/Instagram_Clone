const express = require("express");
const router = express.Router();
router.use(express.json());

const { User } = require("../../models/User");
const {auth} = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const multer = require('multer');

// AWS
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const s3 = require("../../config/s3"); // s3 클라이언트 가져오기


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

    // 파일 있을 경우 AWS에 업로드
    if (req.file) {
      const filename = req.file.originalname;

      // S3에 업로드할 파일 설정
      const uploadParams = {
        Bucket: "insta-clone-coding-swim",
        Key: filename,
        Body: req.file.buffer,
        ACL: "public-read",
        ContentType: req.file.mimetype,
      };

       // S3에 파일 업로드
       const uploadResult = s3.send(new PutObjectCommand(uploadParams));
       user.image = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
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
        message: '서버 오류',
        error: err.message
    });
  });
});

module.exports = router;