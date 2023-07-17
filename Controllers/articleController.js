const { query } = require("../connection/mysql");
const Comment = require("../Models/commentModels");
const allValidation = require("../modules/validation");
const errorMessage = require("../modules/errorMessage");
const successMessage = require("../modules/successMessage");

const articleController = {
  // 取得 user 文章
  getUserArticles: async (req, res, next) => {
    try {
      const userId = req.params.user_id;
      // 檢查 user 是否存在
      let searchResult = await query(
        `select _id, username, about_me from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 尋找文章
      const articleResult = await query(
        `select * from articles where user_id = ${userId}`
      );
      searchResult[0].article = articleResult;
      return successMessage(res, 200, "get user article", searchResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 取得文章
  getOneArticle: async (req, res, next) => {
    try {
      const articleId = req.params.article_id;
      // 檢查文章是否存在
      let articleResult = await query(
        `select title, content, username, user_id, score from articles left join users on articles.user_id = users._id where articles._id = ${articleId}`
      );
      if (articleResult.length == 0) {
        return next(errorMessage(400, "can't find article"));
      }
      // 加上 comment
      const comment = await Comment.find({ article_id: articleId });
      articleResult[0].article_id = articleId;
      articleResult[0].comment = comment;
      return successMessage(res, 200, "get one article", articleResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 隨機取得文章
  getArticle: async (req, res, next) => {
    try {
      // 隨機找一則文章
      let articleResult = await query(`select * from articles`);
      if (articleResult.length == 0) {
        return next(errorMessage(400, "there is no article in this station"));
      }
      const randomIndex = Math.floor(Math.random() * articleResult.length);
      // 查尋作者資料
      const userResult = await query(
        `select _id, username from users where _id = ${articleResult[randomIndex].user_id}`
      );
      if (userResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 查尋留言
      const comment = await Comment.find({
        article_id: articleResult[randomIndex]._id,
      });
      articleResult[randomIndex].user_id = userResult;
      articleResult[randomIndex].comment = comment;
      return successMessage(
        res,
        200,
        "get random article",
        articleResult[randomIndex]
      );
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 新增文章
  createArticle: async (req, res, next) => {
    try {
      const { title, article } = req.body;
      const userId = req.user._id;
      // 檢查格式是否正確
      let { error } = allValidation.createArticle({ title, article });
      if (error) {
        return next(errorMessage(400, error.details[0].message, error));
      }
      // 檢查帳號是否存在
      const searchResult = await query(
        `select * from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 新増
      const createResult = await query(
        `insert into articles( title, user_id, content ) values("${title}",${userId},"${article}")`
      );
      if (!createResult.protocol41) {
        return next(errorMessage(400, "create failed"));
      }
      const data = {
        article_id: createResult.insertId,
        title,
        article,
      };
      return successMessage(res, 201, "create article", data);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 留言
  leaveComment: async (req, res, next) => {
    try {
      const articleId = req.params.article_id;
      const userId = req.user._id;
      const { content } = req.body;
      // 檢查格式是否正確
      let { error } = allValidation.leaveComment({ content });
      if (error) {
        return next(errorMessage(400, error.details[0].message, error));
      }
      // 檢查文章是否存在
      const searchArticle = await query(
        `select * from articles where _id = ${articleId}`
      );
      if (searchArticle.length == 0) {
        return next(errorMessage(400, "can not find article"));
      }
      // 檢查帳號是否存在
      const searchResult = await query(
        `select username from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 尋找此文章是否已有留言
      const searchComment = await Comment.find({ article_id: articleId });
      // 沒有留言，新增
      if (searchComment.length == 0) {
        const comment = await Comment.create({
          article_id: articleId,
          comment: [
            {
              user_id: userId,
              username: searchResult[0].username,
              content,
            },
          ],
        });
        return successMessage(res, 201, "leave message", comment);
      }
      // 有留言，更新
      const updateData = searchComment[0].comment;
      updateData.push({
        user_id: userId,
        username: searchResult[0].username,
        content,
      });
      const updateComment = await Comment.findOneAndUpdate(
        { article_id: articleId },
        { comment: updateData },
        {
          runValidators: true,
          new: true,
        }
      );
      return successMessage(res, 201, "leave message", updateComment);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  //評分
  score: async (req, res, next) => {
    try {
      const articleId = req.params.article_id;
      let { score } = req.body;
      // 檢查格式是否正確
      let { error } = allValidation.score({ score });
      if (error) {
        return next(errorMessage(400, error.details[0].message, error));
      }
      // 檢查文章是否存在
      const searchArticle = await query(
        `select * from articles where _id = ${articleId}`
      );
      if (searchArticle.length == 0) {
        return next(errorMessage(400, "can not find article"));
      }
      // 文章存在，打分数
      score = Number(score);
      let updateScore = score;
      if (searchArticle[0].score != null) {
        updateScore = Math.floor((score + searchArticle[0].score) / 2);
      }
      const update = await query(
        `update articles set score= ${updateScore} where _id = ${articleId}`
      );
      if (!update.protocol41) {
        return next(errorMessage(400, "score failed"));
      }
      return successMessage(res, 201, "score", score);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 刪除文章
  deleteArticle: async (req, res, next) => {
    try {
      const articleId = req.params.article_id;
      // 確認是否有該文章
      const searchResult = await query(
        `select * from articles where _id = ${articleId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find article"));
      }
      // 不是本人不能刪
      if (searchResult[0].user_id != req.user._id) {
        return next(errorMessage(400, "You do not have permission to delete"));
      }
      // 刪除文章
      // 先找留言刪掉
      const searchComment = await Comment.find({ article_id: articleId });
      if (searchComment.length != 0) {
        await Comment.findOneAndDelete({
          article_id: articleId,
        });
      }
      // 文章刪掉
      const deleteResult = await query(
        `delete from articles where _id = ${articleId}`
      );
      if (!deleteResult.protocol41) {
        return next(errorMessage(400, "delete failed"));
      }
      return successMessage(res, 204);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
};

module.exports = articleController;
