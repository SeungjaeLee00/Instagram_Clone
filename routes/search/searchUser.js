const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");

// 닉네임으로 사용자 검색
router.get("/", auth, async (req, res) => {
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
    // console.log("user._id", user._id); // user._id 값 확인
    // 사용자의 게시물 정보 가져오기
    const posts = await Post.find({ user_id: user._id }).select(
      "text images createdAt"
    );
    // console.log("posts", posts); // 게시물 값 확인

    // 팔로우 목록과 팔로워 목록 가져오기
    const following = await Follow.find({ follow_id: user._id }).populate(
      "following",
      "user_id"
    ); // 팔로잉 목록
    const followers = await Follow.find({ following: user._id }).populate(
      "follow_id",
      "user_id"
    ); // 팔로워 목록

    // 사용자 정보와 게시물 정보를 함께 반환
    res.status(200).json({
      userName: user.user_id, // 사용자 이름(user_id)
      userId: user._id, // 사용자 ID 추가
      userNickName: user.name, //실제이름..?
      introduce: user.introduce,
      profile_image: user.profile_image,
      posts: posts, // 사용자의 게시물 배열
      following: following.map((f) => f.following), // 팔로잉 목록
      followers: followers.map((f) => f.follow_id), // 팔로워 목록
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
