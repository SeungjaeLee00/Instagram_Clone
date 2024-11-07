const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { Post } = require("../../models/Post");
const { emitPostLike } = require("../../server"); // 알림 emit 함수 가져오기

// 게시물 좋아요 API
router.post("/:postId/like", auth, async (req, res) => {
  const { postId } = req.params; // URL 파라미터에서 postId 가져오기
  const userId = req.user.id; // 인증된 사용자 ID 가져오기

  try {
    // 게시물 조회
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 이미 좋아요를 누른 게시물인지 확인
    const existingLikeIndex = post.likes.indexOf(userId);

    if (existingLikeIndex !== -1) {
      // 좋아요를 이미 누른 경우, 좋아요 삭제
      post.likes.splice(existingLikeIndex, 1); // likes 배열에서 사용자 ID 제거
      await post.save(); // 변경사항 저장
      return res.status(200).json({ message: "좋아요가 취소되었습니다." });
    } else {
      // 좋아요 추가
      post.likes.push(userId); // likes 배열에 사용자 ID 추가
      await post.save(); // 변경사항 저장

      // 좋아요 알림 emit
      emitPostLike({
        postId: postId,
        likerId: userId,
        message: "게시물을 좋아합니다",
      });

      return res.status(201).json({ message: "좋아요가 추가되었습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
