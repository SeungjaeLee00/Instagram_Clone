const express = require("express");
const router = express.Router();
const { Comment } = require("../../models/Comment"); // 댓글 모델
const { Post } = require("../../models/Post"); // 게시물 모델
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
const { emitComment } = require("../../server"); // server.js의 emit 함수 사용

router.use(cookieParser());

router.post("/:postId", auth, async (req, res) => {
  const { text } = req.body; // 요청 본문에서 text만 가져오기
  const postId = req.params.postId; // 경로 매개변수에서 postId 가져오기
  const userId = req.user._id; // 로그인된 사용자 ID

  try {
    // 해당 게시물이 존재하는지 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 댓글 생성
    const newComment = new Comment({
      post: postId,
      user: userId,
      post: postId,
      text: text,
      createdAt: Date.now(),
    });

    await newComment.save(); // 댓글 DB에 저장

    // 게시물의 comments 배열에 댓글 ID 추가
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id },
    });

    // emitComment 호출
    emitComment({
      postId: postId,
      commentId: newComment._id,
      commentText: newComment.text,
      commenterId: userId,
    });

    return res.status(201).json({
      message: "댓글이 성공적으로 추가되었습니다.",
      comment: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "댓글 추가 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
