var express = require("express");
var router = express.Router();

const userController = require("../Controllers/userController");
const jwtToken = require("../modules/jwtToken");

// 註冊
router.post("/register", userController.register);
// 取得會員資訊
router.get("/:user_id", jwtToken.checkToken, userController.getUserInfo);
// 修改會員資訊
router.patch("/:user_id", jwtToken.checkToken, userController.updateUser);
// 刪除會員
router.delete("/:user_id", jwtToken.checkToken, userController.deleteUser);

module.exports = router;
