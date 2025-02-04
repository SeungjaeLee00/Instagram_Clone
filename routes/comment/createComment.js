const express = require("express");
const router = express.Router();
const { Comment } = require("../../models/Comment"); // 댓글 모델
const { Post } = require("../../models/Post"); // 게시물 모델
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
const { emitComment } = require("../../server"); // server.js의 emit 함수 사용

router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Comments"
 *     description: "댓글 관련 API"
 * /comment/create/{postId}:
 *   post:
 *     description: "게시물에 댓글을 추가하는 API (로그인된 사용자만)"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: "postId"
 *         in: "path"
 *         required: true
 *         description: "댓글을 달 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60b8d6c3f07f6f3b4d455776"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "멋진 게시물입니다!"
 *     responses:
 *       201:
 *         description: "댓글이 성공적으로 추가되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글이 성공적으로 추가되었습니다."
 *                 comment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b1f1f1d1f1f1f1f1f1f"
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60b8d6c3f07f6f3b4d455777"
 *                         user_id:
 *                           type: string
 *                           example: "seungjae"
 *                         profile_image:
 *                           type: string
 *                           example: "https://example.com/profile.jpg"
 *                     post:
 *                       type: string
 *                       example: "60b8d6c3f07f6f3b4d455776"
 *                     text:
 *                       type: string
 *                       example: "멋진 게시물입니다!"
 *                     createdAt:
 *                       type: string
 *                       example: "2025-02-04T10:00:00.000Z"
 *       400:
 *         description: "게시물을 찾을 수 없습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물을 찾을 수 없습니다."
 *       401:
 *         description: "인증되지 않은 사용자. 로그인 후 다시 시도하세요."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인 후 다시 시도해주세요."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글 추가 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message here"
 */

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

    // 포스트 작성자 object id 저장
    const postUserId = post.user_id;

    // 댓글 생성
    const newComment = new Comment({
      user: userId,
      post: postId,
      text: text,
      createdAt: Date.now(),
    });
    console.log("서버", newComment);
    await newComment.save(); // 댓글 DB에 저장

    // 게시물의 comments 배열에 댓글 ID 추가
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id },
    });

    // 저장된 댓글에 사용자 정보를 포함하도록 populate
    const populatedComment = await Comment.findById(newComment._id).populate({
      path: "user",
      select: "_id user_id profile_image",
    });

    // console.log("comenterProfile: ", populatedComment.user.profile_image);
    // emitComment 호출
    emitComment({
      postId: postId,
      postUserId: postUserId,
      commentId: newComment._id,
      commentText: newComment.text,
      commenterId: userId,
      commenterName: populatedComment.user.user_id,
      comenterProfile: populatedComment.user.profile_image,
    });

    return res.status(201).json({
      message: "댓글이 성공적으로 추가되었습니다.",
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "댓글 추가 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
