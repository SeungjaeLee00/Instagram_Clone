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

/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/upload:
 *   post:
 *     description: "게시물 업로드 API (로그인된 사용자만)"
 * tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: "게시물 내용 (선택사항)"
 *                 example: "이것은 테스트 게시물입니다."
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "업로드할 이미지 파일들 (최대 10장)"
 *     responses:
 *       201:
 *         description: "게시물 업로드 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물이 성공적으로 업로드되었습니다."
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60e5b0f5b1f16b001c9a8f7a"
 *                     text:
 *                       type: string
 *                       example: "이것은 테스트 게시물입니다."
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uri
 *                         example: "https://post-jae.s3.amazonaws.com/1617895460000_image.jpg"
 *       400:
 *         description: "이미지가 최소 1장이 포함되지 않음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "최소 1장의 이미지를 포함해야 게시물을 업로드할 수 있습니다."
 *       401:
 *         description: "인증되지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인된 사용자만 게시물을 업로드할 수 있습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물 업로드 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

// 게시물 업로드
router.post("/", auth, upload, async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id; // 로그인된 사용자 ID 가져오기

  if (!userId) {
    return res.status(401).json({
      message: "로그인된 사용자만 게시물을 업로드할 수 있습니다.",
    });
  }

  // 이미지가 최소 한 장 이상 포함되었는지 확인
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "최소 1장의 이미지를 포함해야 게시물을 업로드할 수 있습니다.",
    });
  }

  try {
    // S3 업로드할 이미지 URL 배열 생성
    const imageUrls = [];

    for (let file of req.files) {
      const filename = `${Date.now()}_${file.originalname}`;
      const uploadParams = {
        Bucket: "post-jae",
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      // S3에 파일 업로드
      await s3.send(new PutObjectCommand(uploadParams));
      const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
      imageUrls.push(imageUrl);
    }

    // 새로운 게시물 생성 및 저장
    const newPost = new Post({
      user_id: userId,
      text: text || "",
      images: imageUrls,
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
