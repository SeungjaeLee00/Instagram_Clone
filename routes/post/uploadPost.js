const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const storage = multer.memoryStorage();
const upload = multer({ storage }).array("images", 10); // 최대 10장의 이미지 업로드
const s3 = require("../../config/s3"); // S3 클라이언트 가져오기

// 게시물 업로드
router.post("/", auth, upload, async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id; // 로그인된 사용자 ID 가져오기

  if (!userId) {
    return res.status(401).json({
      message: "로그인된 사용자만 게시물을 업로드할 수 있습니다.",
    });
  }

  try {
    // S3 업로드할 이미지 URL 배열 생성
    const imageUrls = [];

    // if (req.files) {
    //   for (let file of req.files) {
    //     const filename = `${Date.now()}_${file.originalname}`;
    //     const uploadParams = {
    //       Bucket: "your-bucket-name",
    //       Key: filename,
    //       Body: file.buffer,
    //       ACL: "public-read",
    //       ContentType: file.mimetype,
    //     };

    //     // S3에 파일 업로드
    //     await s3.send(new PutObjectCommand(uploadParams));
    //     const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    //     imageUrls.push(imageUrl);
    //   }
    // }

    // 새로운 게시물 생성 및 저장
    const newPost = new Post({
      user: userId,
      text: text,
      //   images: imageUrls,
    });

    await newPost.save();

    return res.status(201).json({
      message: "게시물이 성공적으로 업로드되었습니다.",
      post: newPost,
    });
  } catch (err) {
    return res.status(500).json({
      message: "게시물 업로드 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
