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
const s3 = require("../../config/s3"); // S3 클라이언트 가져오기
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// 게시물 수정
router.patch("/:id", auth, upload, async (req, res) => {
  const { id } = req.params;
  const { text, imagesToDelete } = req.body; // 수정할 텍스트, 삭제할 이미지

  try {
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "권한이 없습니다." });

    // 본문 내용 수정
    if (text) {
      post.text = text;
    }

    // 이미지 삭제 로직
    if (imagesToDelete && post.images.length > 1) {
      for (const imageUrl of imagesToDelete) {
        // S3에서 이미지 삭제
        const key = imageUrl.split("/").pop(); // URL에서 파일 이름 추출
        const bucket = "post-jae";

        console.log("Deleting image:", imageUrl);
        console.log("Key for S3:", key);

        const deleteParams = {
          Bucket: bucket,
          Key: key,
        };

        await s3.send(new DeleteObjectCommand(deleteParams));

        // DB에서 해당 이미지 URL 삭제
        post.images = post.images.filter((img) => img !== imageUrl);
      }
    } else if (imagesToDelete && post.images.length <= 1) {
      return res
        .status(400)
        .json({ message: "이미지가 1장 이상 남아야 합니다." });
    }

    await post.save(); // 수정된 게시물 저장

    return res.status(200).json({ message: "게시물이 수정되었습니다.", post });
  } catch (err) {
    return res.status(500).json({
      message: "게시물 수정 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
