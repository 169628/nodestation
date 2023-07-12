const express = require("express");
const router = express.Router();

const articleController = require("../Controllers/articleController");
const jwtToken = require("../modules/jwtToken");

// 取得 user 文章
router.get("/:user_id", articleController.getUserArticles);
// 取得文章
router.get("/one/:article_id", articleController.getOneArticle);
// 隨機取得文章
router.get("/", articleController.getArticle);
// 新增文章
router.post("/", jwtToken.checkToken, articleController.createArticle);
// 留言
router.post(
  "/comment/:article_id",
  jwtToken.checkToken,
  articleController.leaveComment
);
// 評分
router.post("/score/:article_id", articleController.score);
// 刪除文章
router.delete(
  "/:article_id",
  jwtToken.checkToken,
  articleController.deleteArticle
);

module.exports = router;
