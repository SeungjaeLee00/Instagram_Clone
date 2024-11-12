const express = require("express");
const router = express.Router();

const {router: chatRoutes } = require("./message");
const chatroomRoutes = require("./chatroom");

router.use("/chatroom/message", chatRoutes);
router.use("/chatroom", chatroomRoutes);

module.exports = router;