// 게시물 조회
const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { Comment } = require("../../models/Comment");

// 게시물 조회
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      // populate 사용하면 어떤 컬렉션에서 ObjectId를 이용해서 다른 컬렉션의 정보를 담아 출력할 수 잇음
      .populate("comments") // 게시물의 댓글을 populate
      .populate("user", "username"); // 게시물 작성자의 정보도 populate (선택 사항)

    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({
      message: "게시물 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
