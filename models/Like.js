const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId로 수정
    ref: "User", // User 모델을 참조
    required: true,
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId로 수정
    ref: "Post", // Post 모델을 참조
    required: true,
  },
  comment_id: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Like = mongoose.model("Like", likeSchema);
module.exports = { Like };
