const mongoose = require("mongoose");

const followSchema = new mongoose.Schema ({
    // 현재 로그인 되어 있는 id
    follow_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    follow_name: {
        type: String,
        ref: 'User',
        required: true,
        default: 'undefined',
    },
    follow_profile: {
        type : String,
        ref: 'User',
        default: '',
    },
    // 현재 로그인된 사용자가 팔로우 하려는 사람의 id, name
    following : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    following_name: {
        type: String,
        ref: 'User',
        required: true,
        default: 'undefined',
    },

});

const Follow = mongoose.model("Follow", followSchema); 

module.exports = {Follow};