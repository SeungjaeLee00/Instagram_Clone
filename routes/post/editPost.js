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
