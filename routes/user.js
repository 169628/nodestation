var express = require("express");
var router = express.Router();

const userController = require("../Controllers/userController");
const jwtToken = require("../modules/jwtToken");

// 註冊
router.post("/register", userController.register);
router.get("/:user_id", jwtToken.checkToken, userController.getUserInfo);

module.exports = router;
