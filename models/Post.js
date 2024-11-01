const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    // 사용자 ID (User 모델의 ObjectId)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 게시물 모델 생성
const Post = mongoose.model("Post", postSchema);

// 게시물 모델 내보내기
module.exports = { Post };
