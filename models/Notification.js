// models/notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // 알림을 받는 사용자 ID
  },
  type: {
    type: String,
    enum: ["comment", "like"], // 알림 타입: 댓글, 좋아요
    required: true,
  },
  data: {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: function () {
        return this.type === "comment";
      }, // 댓글일 때만 필요
    },
    likerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "like";
      }, // 좋아요일 때만 필요
    },
    commentText: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
