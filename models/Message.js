const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    // 현재 채팅방 위치
    chatroom: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chatroom',
        required: true,
    },
    title: {
        type: String,
        ref: 'Chatroom',
    },
    // 메시지
    content: {
        type: String,
        required: true,
    },
    // 현재 접속해 있는 object _id
    object_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    // 현재 접속해 있는 user_id
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
