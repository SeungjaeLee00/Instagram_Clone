const mongoose = require("mongoose");

const followSchema = new mongoose.Schema ({
    // 현재 로그인 되어 있는 id
    follow_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    //
    following : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
});

const Follow = mongoose.model("Follow", followSchema); 

module.exports = {Follow};