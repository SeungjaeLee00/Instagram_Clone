// 로그아웃
app.get('/auth/logout', auth, (req, res) => {
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