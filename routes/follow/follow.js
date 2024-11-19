const express = require("express");
const router = express.Router();
router.use(express.json());

const {Follow} = require("../../models/Follow");
const {auth} = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());


router.post("/following", auth, async (req, res) => {
    const user_id = req.user._id; // 로그인 되어 있는 사용자
    const following_id = req.body.following_id; // 팔로우 하고 싶은 사용자
    
    try{
        const checkFollow = await Follow.findOne({
            follow_id: user_id,
            following: following_id,
        })

        // 이미 팔로우 중인 경우
        if(checkFollow){         
            return res.status(400).json({
                message: "이미 팔로우 중입니다.",
            });
        }

        const saveFollow = new Follow({
            follow_id: user_id,
            following: following_id
        });

        const result = await saveFollow.save();
        
        return res.status(201).json({
            message: "팔로우 성공",
            follow_id: result.follow_id,
            following: result.following,
        });

    } catch(err){
        return res.status(500).json({
            error: err.message,
        })
    };
});

router.get("/following", auth, async (req, res) => {
    const user_id = req.user._id;
    
    try{
        const result = await Follow.find({follow_id: user_id});

        // 팔로우 하고 있는 유저가 없는 경우
        if (!result.length) {
            console.log(result.user_id)
            return res.status(404).json({
                message: "팔로우 중인 유저가 없습니다.",
            });
        }

        const followingList = result.map(follow => follow.following);

        return res.status(200).json({
            following : followingList,
        });

    } catch(err){

        return res.status(500).json({
            error: err
        });

    };
});

router.get("/follower", auth, async (req, res) => {
    const user_id = req.user._id;

    try{
        // 현재 로그인 되어 있는 유저를 팔로우 하고 있는 아이디 찾기
        const result = await Follow.find({following: user_id});

        if (!result.length) {
            return res.status(404).json({
                message: "팔로워가 없습니다.",
            });
        }

        const followerList = result.map(follow => follow.follow_id);

        return res.status(200).json({
            followers: followerList,
        });

    }catch(err){

        return res.status(500).json({
            error: err.message,
        });

    };
});

module.exports = router;