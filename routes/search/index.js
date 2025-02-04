const express = require("express");
const router = express.Router();

const searchUser = require("./searchUser");
const searchMultiUsers = require("./searchMultiUsers");

/**
 * @swagger
 * tags:
 *   - name: "Search"
 *   - description: "검색 관련 api"
 */

router.use("/single", searchUser);
router.use("/multiple", searchMultiUsers);

module.exports = router;
