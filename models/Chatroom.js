const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema ({
    title: {
        type:String,
        default: "채팅방" // 기본 채팅방
    },

    members : [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    }],

    date: {
        type: Date,
        Default: Date.now
    }

});

const Chatroom = mongoose.model("Chatroom", chatroomSchema); 

module.exports = {Chatroom};