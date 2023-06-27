var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/register", function (req, res, next) {
  res.render("register");
});

router.get("/user", function (req, res, next) {
  res.render("user");
});

router.get("/create", function (req, res, next) {
  res.render("create");
});

router.get("/save", function (req, res, next) {
  res.render("save");
});

router.get("/follow", function (req, res, next) {
  res.render("follow");
});

router.get("/update", function (req, res, next) {
  res.render("update");
});

router.get("/password", function (req, res, next) {
  res.render("password");
});

router.get("/score", function (req, res, next) {
  res.render("score");
});

module.exports = router;
