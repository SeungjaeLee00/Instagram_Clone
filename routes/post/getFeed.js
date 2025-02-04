const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");
const { User } = require("../../models/User");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/feed/:
 *   get:
 *     description: "사용자가 팔로우한 사용자의 최근 게시물을 조회하거나, 팔로우한 사용자의 게시물이 없을 경우 사용자 자신의 최근 게시물을 조회하는 API (로그인된 사용자만)"
 * tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "팔로우한 사용자의 게시물 조회 또는 내 게시물 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "팔로우한 사용자의 최근 게시물입니다."
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60e5b0f5b1f16b001c9a8f7a"
 *                       text:
 *                         type: string
 *                         example: "게시물 내용입니다."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-04T12:30:00.000Z"
 *                       likesCount:
 *                         type: integer
 *                         example: 10
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "60e5b0f5b1f16b001c9a8f7b"
 *                             text:
 *                               type: string
 *                               example: "댓글 내용입니다."
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-02-04T12:35:00.000Z"
 *                             likesCount:
 *                               type: integer
 *                               example: 5
 *                             liked:
 *                               type: boolean
 *                               example: false
 *                             user:
 *                               type: object
 *                               properties:
 *                                 user_id:
 *                                   type: string
 *                                   example: "seungjae"
 *                                 username:
 *                                   type: string
 *                                   example: "seungjae"
 *                                 profile_image:
 *                                   type: string
 *                                   example: "https://example.com/profile_image.jpg"
 *       401:
 *         description: "인증되지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증된 사용자가 아닙니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "피드 조회 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

// 팔로우한 사용자의 최근 게시물 조회
router.get("/", auth, async (req, res) => {
  const user_id = req.user._id;

  try {
    // 현재 사용자가 팔로우한 사용자 ID 목록 가져오기
    const following = await Follow.find({ follow_id: user_id }).select(
      "following"
    );

    // 팔로우한 사용자가 있을 때, 그들의 게시물 조회
    const followingIds = following.map((follow) => follow.following);
    console.log("Following List:", following);

    const activeUsers = await User.find({
      _id: { $in: followingIds },
      isActive: true,
    }).select("_id");

    console.log("Active users:", activeUsers);
    const activeUserIds = activeUsers.map((user) => user._id);

    // 탈퇴한 사용자의 게시물 제외
    const posts = await Post.find({ user_id: { $in: activeUserIds } })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .populate("user_id", "user_id profile_image") // 'user_id' 필드의 'username' 가져오기
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });
    // console.log("Posts from followed users:", posts);

    // 팔로우한 사용자의 게시물이 없으면 내 게시물을 조회
    if (posts.length === 0) {
      // 내 게시물 조회
      const myPosts = await Post.find({ user_id: user_id, archived: false }) // 'user' -> 'user_id'로 수정
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user_id", "user_id profile_image")
        .populate({
          path: "comments",
          populate: { path: "user", select: "user_id username profile_image" },
        });

      // console.log("My Posts:", myPosts);

      // 내 게시물의 좋아요 수 및 댓글의 좋아요 수 포함
      const myPostsWithDetails = myPosts.map((post) => ({
        ...post.toObject(),
        likesCount: post.likes.length,
        comments: post.comments.map((comment) => ({
          ...comment.toObject(),
          liked: comment.likes.includes(user_id),
          likesCount: comment.likes.length,
        })),
      }));

      return res.status(200).json({
        message: "팔로우한 사용자의 게시물이 없으므로 내 게시물을 조회합니다.",
        posts: myPostsWithDetails,
      });
    }

    // 게시물의 좋아요 수 및 댓글의 좋아요 수 포함
    const postsWithDetails = posts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        liked: comment.likes.includes(user_id),
        likesCount: comment.likes.length,
      })),
    }));

    return res.status(200).json({
      message: "팔로우한 사용자의 최근 게시물입니다.",
      posts: postsWithDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "피드 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
