const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

router.put("/:id/archive", auth, async (req, res) => {
  const { id } = req.params;
  const { userId, archive } = req.body;
  //   console.log("요청 받은 userId:", userId);
  //   console.log("인증된 사용자 ID:", req.user._id);

  try {
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

    if (post.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    post.archived = archive;
    await post.save();

    const message = archive
      ? "게시물이 보관 완료되었습니다."
      : "게시물이 보관 취소되었습니다.";

    return res.status(200).json({ message });
  } catch (err) {
    console.error("게시물 보관 처리 중 오류 발생:", err);
    return res.status(500).json({
      message: "게시물 보관 처리 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
