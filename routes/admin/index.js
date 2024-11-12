const express = require("express");
const router = express.Router();

const adminSignupRoutes = require("./adminSignup");

router.use("/adminSignup", adminSignupRoutes);

module.exports = router;
