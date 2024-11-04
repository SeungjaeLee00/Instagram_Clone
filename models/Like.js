const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  post_id: {
    type: String,
    required: false,
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
