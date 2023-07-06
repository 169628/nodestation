const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../Controllers/authController");

// 註冊
router.post("/login", authController.login);
// 忘記密碼
router.post("/password", authController.forgetPassword);
// google 登入
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    prompt: "select_account",
  })
);
// google 重新導向 url
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);

module.exports = router;
