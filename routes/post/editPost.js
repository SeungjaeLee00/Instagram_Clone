const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage }).array("images", 10); // 최대 10장의 이미지 업로드
const s3 = require("../../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/edit/{id}:
 *   patch:
 *     description: "게시물을 수정하는 API (로그인된 사용자만)"
 *     tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "수정할 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60e5b0f5b1f16b001c9a8f7a"
 *       - name: body
 *         in: body
 *         required: true
 *         description: "수정할 게시물의 내용과 삭제할 이미지 정보"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   example: "수정된 게시물 내용입니다."
 *                 imagesToDelete:
 *                   type: string
 *                   example: "[\"https://post-jae.s3.amazonaws.com/old_image.jpg\"]"
 *     responses:
 *       200:
 *         description: "게시물이 성공적으로 수정되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물이 수정되었습니다."
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60e5b0f5b1f16b001c9a8f7a"
 *                     text:
 *                       type: string
 *                       example: "수정된 게시물 내용입니다."
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://post-jae.s3.amazonaws.com/new_image.jpg"]
 *       400:
 *         description: "잘못된 요청 (예: 삭제할 이미지가 1장 이하)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "이미지가 1장 이상 남아야 합니다."
 *       401:
 *         description: "인증되지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증된 사용자가 아닙니다."
 *       403:
 *         description: "권한 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물 수정 권한이 없습니다."
 *       404:
 *         description: "게시물 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물을 찾을 수 없습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물 수정 중 오류가 발생했습니다."
 */

// 게시물 수정
router.patch("/:id", auth, upload, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  let imagesToDelete = [];

  // imagesToDelete 파싱
  if (req.body.imagesToDelete) {
    try {
      imagesToDelete = JSON.parse(req.body.imagesToDelete);
      console.log("Parsed imagesToDelete:", imagesToDelete);
    } catch (err) {
      console.error("imagesToDelete 파싱 오류:", err.message);
      return res
        .status(400)
        .json({ message: "잘못된 imagesToDelete 형식입니다." });
    }
  }

  try {
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

    if (!post.user_id) {
      return res
        .status(400)
        .json({ message: "게시물의 사용자를 찾을 수 없습니다." });
    }

    if (!req.user) {
      return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
    }

    if (text) {
      post.text = text;
    }

    // 이미지 삭제 로직
    if (imagesToDelete.length > 0) {
      // 이미 삭제할 이미지가 있는 경우
      if (post.images.length <= 1) {
        return res
          .status(400)
          .json({ message: "이미지가 1장 이상 남아야 합니다." });
      }

      for (const imageUrl of imagesToDelete) {
        try {
          const key = imageUrl.split(".com/")[1]; // Key 추출
          console.log("Deleting image from S3. Key:", key);

          const deleteParams = {
            Bucket: "post-jae",
            Key: key,
          };

          // S3에서 이미지 삭제
          await s3.send(new DeleteObjectCommand(deleteParams));

          // DB에서 해당 이미지 URL 삭제
          post.images = post.images.filter((img) => img !== imageUrl);
        } catch (err) {
          console.error("S3 이미지 삭제 중 오류:", err.message);
        }
      }
    }

    await post.save();

    // console.log("Updated post:", post);

    return res.status(200).json({ message: "게시물이 수정되었습니다.", post });
  } catch (err) {
    return res.status(500).json({
      message: "게시물 수정 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
