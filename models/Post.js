const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  archived: { type: Boolean, default: false },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: false,
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
  comments: [
    {
      // 댓글을 저장할 필드 추가
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Comment 모델을 참조
    },
  ],
  likes: [
    {
      // 좋아요를 누른 사용자 ID를 저장
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
