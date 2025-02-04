const express = require("express");
const router = express.Router();
router.use(express.json());

const { User } = require("../../models/User");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const multer = require("multer");

/**
 * @swagger
 * tags:
 *   - name: "Users"
 *     description: "사용자 관련 API"
 * /profile/edit:
 *   patch:
 *     description: "사용자 정보 수정 API (로그인된 사용자만)"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_name:
 *                 type: string
 *                 description: "사용자 이름"
 *                 example: "김철수"
 *               new_user_id:
 *                 type: string
 *                 description: "사용자 회원 ID"
 *                 example: "chulsoo"
 *               new_introduce:
 *                 type: string
 *                 description: "사용자 자기소개"
 *                 example: "안녕하세요, 개발자 김철수입니다."
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "사용자 프로필 이미지 (선택사항)"
 *     responses:
 *       200:
 *         description: "사용자 정보 수정 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "정보가 수정되었습니다."
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60e5b0f5b1f16b001c9a8f7a"
 *                     name:
 *                       type: string
 *                       example: "김철수"
 *                     user_id:
 *                       type: string
 *                       example: "chulsoo"
 *                     profile_image:
 *                       type: string
 *                       format: uri
 *                       example: "https://insta-clone-coding-swim.s3.amazonaws.com/1617895460000_profile.jpg"
 *       400:
 *         description: "필수 데이터가 누락됨"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "필수 데이터를 입력하세요."
 *       401:
 *         description: "인증되지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인된 사용자만 정보를 수정할 수 있습니다."
 *       404:
 *         description: "사용자 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자를 찾을 수 없습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류"
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

// AWS
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const s3 = require("../../config/s3"); // s3 클라이언트 가져오기

// 사용자 정보 수정(이름, 회원id, 자기소개)
router.patch("/", auth, upload.single("file"), (req, res) => {
  const { new_name, new_user_id, new_introduce } = req.body;

  User.findById(req.user._id)
    .then((user) => {
      if (!user)
        return res.status(404).json({
          message: "사용자를 찾을 수 없습니다.",
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
        user.profile_image = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
      }

      user
        .save()
        .then((updatedUser) => {
          return res.json({
            message: "정보가 수정되었습니다.",
            user: updatedUser,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            message: "정보 저장 중 오류가 발생했습니다.",
            error: err.message,
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "서버 오류",
        error: err.message,
      });
    });
});

module.exports = router;
