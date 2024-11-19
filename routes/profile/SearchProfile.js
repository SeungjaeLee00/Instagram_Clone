const express = require("express");
const router = express.Router();
router.use(express.json());

const { User } = require("../../models/User");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

router.get('/', auth, (req, res) => {
    User.findById(req.user._id)
    .then((result) => {
        return res.status(200).json({
            user_id: result.user_id,
            user_name: result.name,
            introduce: result.introduce,
            image: result.image,
        });
    })
    .catch ((err) => {
        res.status(500).json({ message: err });
    });
});

module.exports = router;
