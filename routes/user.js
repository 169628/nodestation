var express = require("express");
var router = express.Router();

const userController = require("../Controllers/userController");
const jwtToken = require("../modules/jwtToken");

// 註冊
router.post("/register", userController.register);
// 取得會員資訊
router.get("/", jwtToken.checkToken, userController.getUserInfo);
// 修改會員資訊
router.patch("/", jwtToken.checkToken, userController.updateUser);
// 刪除會員
router.delete("/", jwtToken.checkToken, userController.deleteUser);
// 取得已存文章
router.get("/article", jwtToken.checkToken, userController.getSaved);
// 儲存文章
router.post("/article/:article_id", jwtToken.checkToken, userController.save);
// 刪除已存文章
router.delete(
  "/article/:article_id",
  jwtToken.checkToken,
  userController.deleteSave
);

module.exports = router;
