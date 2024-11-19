const express = require("express");
const router = express.Router();

const followRoutes = require("./follow");

router.use("/", followRoutes);

module.exports = router;