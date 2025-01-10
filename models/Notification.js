const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  // 알림
  Notification: {
    type: String,
    required: true,
  },
  // 알림받는 사용자 object _id
  object_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // 댓글 좋아요, 새 댓글, 포스트 좋아요 누른 사람의 object_id
  other_object_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // 댓글 좋아요, 새 댓글, 포스트 좋아요 누른 사람의 user_id
  other_user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  NotificationType: {
    type: String,
    required: true,
  },
  profile_image: { 
    type: String, 
    ref: "User",
    default: "" 
  },
  // post 위치
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification };
