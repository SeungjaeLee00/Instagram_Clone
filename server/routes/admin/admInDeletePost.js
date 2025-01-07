const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { auth } = require("../auth");
const { User } = require("../../models/User");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../config/s3");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 게시물 삭제 (관리자 권한)
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user._id);

    // 관리자가 아닌 경우 권한 거부
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "게시물을 삭제할 권한이 없습니다." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // S3에서 이미지 삭제
    for (let imageUrl of post.images) {
      const key = imageUrl.split(".com/")[1];
      const deleteParams = {
        Bucket: "post-jae",
        Key: key,
      };

      await s3.send(new DeleteObjectCommand(deleteParams));
    }

    await Post.findByIdAndDelete(id); // DB에서 게시물 삭제

    return res
      .status(200)
      .json({ message: "게시물이 성공적으로 삭제되었습니다." });
  } catch (err) {
    return res.status(500).json({
      message: "게시물 삭제 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
