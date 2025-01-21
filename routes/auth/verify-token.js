const express = require("express");
const { auth } = require("../auth");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());

router.get("/", auth, (req, res) => {
  console.log("req.cookie", req.cookies);
  const token = req.cookies.x_auth;

  if (!token) {
    return res.status(401).json({
      isAuth: false,
      message: "확인 가능한 토큰이 없습니다.",
    });
  }

  const userEmail = req.user.email || null;
  const username = req.user.username || null;

  res.status(200).json({
    isAuth: true,
    user: {
      userId: req.user._id,
      email: userEmail,
      username: username,
    },
  });
});

module.exports = router;
