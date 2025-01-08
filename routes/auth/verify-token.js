const express = require("express");
const { auth } = require("../auth");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());

router.get("/verify-token", auth, (req, res) => {
  // 인증이 완료되었으므로, 사용자 정보를 응답으로 보냄
  res.status(200).json({
    isAuth: true,
    user: {
      userId: req.user._id,
      email: req.user.email,
      username: req.user.username,
    },
  });
});

module.exports = router;
