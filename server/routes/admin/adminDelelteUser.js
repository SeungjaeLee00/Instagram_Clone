const express = require("express");
const router = express.Router();

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Like } = require("../../models/Like");
const { Comment } = require("../../models/Comment");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 특정 사용자 삭제 (관리자 권한)
router.delete("/:userId", auth, async (req, res) => {
  const { userId } = req.params;

  try {
    // 로그인된 사용자 정보를 가져오기
    const adminUser = await User.findById(req.user._id);

    // 유저가 존재하지 않거나 관리자가 아닌 경우 권한 거부
    if (!adminUser || adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "사용자를 삭제할 권한이 없습니다." });
    }

    // 삭제할 사용자를 조회
    const userToDelete = await User.findById(userId);

    // 사용자가 존재하지 않거나 관리자가 아닌 경우에만 삭제 가능
    if (!userToDelete) {
      return res
        .status(404)
        .json({ message: "삭제할 사용자를 찾을 수 없습니다." });
    }
    if (userToDelete.role === "admin") {
      return res.status(403).json({ message: "관리자는 삭제할 수 없습니다." });
    }
    // 사용자 삭제 전에 해당 사용자가 남긴 좋아요 삭제
    await Like.deleteMany({ user: userId });

    // 사용자가 작성한 모든 게시물 삭제
    await Post.deleteMany({ user: userId });

    // 사용자가 작성한 모든 댓글 삭제
    await Comment.deleteMany({ user: userId });

    // 사용자 자체 삭제
    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    return res.status(500).json({
      message: "사용자 삭제 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
