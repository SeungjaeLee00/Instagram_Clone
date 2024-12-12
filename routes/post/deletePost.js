const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { Comment } = require("../../models/Comment");
const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../config/s3");

// 게시물 삭제
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // 클라이언트에서 받은 userId
  console.log("요청 받은 userId:", userId); // 로그로 userId 확인

  try {
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

    console.log("게시물 작성자 userId:", post.user_id.toString()); // 게시물 작성자 ID 확인

    if (post.user_id.toString() !== userId)
      return res.status(403).json({ message: "권한이 없습니다." });

    // S3에서 이미지 삭제
    for (let imageUrl of post.images) {
      const key = imageUrl.split(".com/")[1]; // URL에서 키 추출
      const deleteParams = {
        Bucket: "post-jae",
        Key: key,
      };

      await s3.send(new DeleteObjectCommand(deleteParams)); // S3에서 이미지 삭제
    }

    // 댓글 삭제
    await Comment.deleteMany({ post: id });

    // 게시물 삭제
    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: "게시물이 삭제되었습니다." });
  } catch (err) {
    console.error("게시물 삭제 중 오류 발생:", err); // 로그 추가
    return res.status(500).json({
      message: "게시물 삭제 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
