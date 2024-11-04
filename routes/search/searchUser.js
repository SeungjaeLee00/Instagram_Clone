const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");

// 닉네임으로 사용자 검색
router.get("/", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ message: "user_id를 입력해주세요." });
  }

  try {
    // user_id가 주어진 입력과 일치하는 사용자 찾기 (대소문자 구분X)
    const user = await User.findOne({
      user_id: { $regex: user_id, $options: "i" },
    });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 사용자의 게시물 정보 가져오기
    const posts = await Post.find({ user: user._id }) // user 필드가 사용자의 ID와 일치하는 게시물 찾기
      .select("text images createdAt"); // 필요한 필드만
    // .populate("comments"); // 댓글 정보

    // 사용자 정보와 게시물 정보를 함께 반환
    res.status(200).json({
      userName: user.user_id, // 사용자 이름(user_id)
      posts: posts, // 사용자의 게시물 배열
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
