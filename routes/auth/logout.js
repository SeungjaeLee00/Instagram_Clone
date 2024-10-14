const express = require("express");
const app = express.Router();

const { User } = require("../../models/User");
const {auth} = require("../auth");

//
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// 로그아웃
app.get('/', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id},
      {token: ""}
    )
    .then(() => {
      return res.status(200).json({
        logoutSuccess: true,
      });
    })
    .catch((err)=>{
      return res.status(400).json({
        logoutSuccess: false,
        message: err.message
      });
    })
})

module.exports = app;