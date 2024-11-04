// 임시
const express = require("express");
const router = require("express").Router();
router.use(express.json());
const {auth} = require("../auth");

const {Chatroom} = require("../../models/Chatroom");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 내가 속해 있는 모든 채팅방 가져오기
router.get("/", auth, (req, res) => {
    Chatroom.find(
        {members : req.user._id}
    )
    .then((chatrooms) => {
        const titles = chatrooms.map(chatroom => chatroom.title);

        if(chatrooms) {
            res.json({
                message: "참여 중인 채팅방 목록",
                chatrooms: titles
            });
        } else{
            res.json({
                message: "채팅방이 없습니다."
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: "채팅방 조회 실패",
            error : error
        })
    })
});

module.exports = router ;