const express = require("express");
const router = express.Router();

const adminSignupRoutes = require("./adminSignup");

router.use("/sign-up", adminSignupRoutes);

module.exports = router;
