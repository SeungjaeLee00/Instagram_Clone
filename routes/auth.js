const { User } = require("../models/User");

let auth = (req, res, next) => {
    // 클라이언트로부터 쿠키 가져오기
    let token = req.cookies.x_auth;

    // 토큰 복호화 후 user 찾기
    User.findByToken(token)
    .then((user) => {    
        if(!user){
            throw new Error("유효하지 않은 토큰입니다.");
        }
        req.token = token;
        req.user = user;
        return next();
    })
    .catch((err) => {
        return res.status(401).json({
            isAuth: false,
            message: err.message
        });
    });
}

module.exports = {auth};