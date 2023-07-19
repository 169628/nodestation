const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const { query } = require("../connection/mysql");
const allValidation = require("../modules/validation");
const mailSender = require("../modules/mailSender");
const errorMessage = require("../modules/errorMessage");
const successMessage = require("../modules/successMessage");
const Follow = require("../Models/followModels");

const userController = {
  // 註冊
  register: async (req, res, next) => {
    try {
      const { name, mail } = req.body;
      // 檢查格式是否正確
      let { error } = allValidation.register({ name, mail });
      if (error) {
        return next(errorMessage(400, error.details[0].message, error));
      }
      // 檢查 email 是否已註冊
      const searchResult = await query(
        `select * from users where email = "${mail}"`
      );
      // 已註冊回傳錯誤
      if (searchResult.length != 0) {
        return next(
          errorMessage(
            400,
            "This mail is already registered, please log in with this mail"
          )
        );
      }
      // 未註冊並寄送密碼
      const password = uuidv4().substr(0, 6);
      const insertPassword = await bcrypt.hash(password, 12);
      const insertResult = await query(
        `insert into users(username,email,password) values("${name}","${mail}","${insertPassword}")`
      );
      if (!insertResult.protocol41) {
        return next(errorMessage(400, "register failed"));
      }
      const data = {
        _id: insertResult.insertId,
        username: name,
        email: mail,
      };
      return mailSender(res, 201, mail, password, data, next);
    } catch (err) {
      return next(errorMessage(500, "register failed", err));
    }
  },
  // 取得會員資訊
  getUserInfo: async (req, res, next) => {
    try {
      // 用 token 裡的 user._id
      const userId = req.user._id;
      const searchResult = await query(
        `select _id, username, email, about_me from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      return successMessage(res, 200, "get user info", searchResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 修改會員資訊
  updateUser: async (req, res, next) => {
    try {
      const userId = req.user._id;
      const body = ({ name, mail, password, repeatPassword, aboutMe } =
        req.body);
      // 有值的再檢查格式是否正確
      let checkData = {};
      for (let key in body) {
        if (body[key] != "") {
          checkData[key] = body[key];
        }
      }
      let { error } = allValidation.update(checkData);
      if (error) {
        return next(errorMessage(400, error.details[0].message, error));
      }
      // 檢查 user 是否存在
      const searchResult = await query(
        `select * from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 不是本人不能修改
      if (searchResult[0]._id != userId) {
        return next(errorMessage(400, "You do not have permission to update"));
      }
      // 準備 update 的資料
      let updateData = {
        username:
          checkData.name == undefined
            ? searchResult[0].username
            : checkData.name,
        email:
          checkData.mail == undefined ? searchResult[0].email : checkData.mail,
        password:
          checkData.password == undefined
            ? searchResult[0].password
            : await bcrypt.hash(checkData.password, 12),
        about_me:
          checkData.aboutMe == undefined
            ? searchResult[0].about_me
            : checkData.aboutMe,
      };
      // 更新
      const updateResult = await query(
        `update users set username="${updateData.username}", email="${updateData.email}", password="${updateData.password}", about_me="${updateData.about_me}" where _id=${userId}`
      );
      if (!updateResult.protocol41) {
        return next(errorMessage(400, "update failed"));
      }
      updateData._id = userId;
      delete updateData.password;
      return successMessage(res, 201, "update user", updateData);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 刪除會員
  deleteUser: async (req, res, next) => {
    try {
      const userId = req.user._id;
      // 確認是否有該 user
      const searchResult = await query(
        `select * from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 不是本人不能刪
      if (searchResult[0]._id != userId) {
        return next(errorMessage(400, "You do not have permission to delete"));
      }
      // 刪除帳號
      // 先找追蹤刪掉
      const follow = await Follow.find({ user_id: userId });
      if (follow.length != 0) {
        await Follow.deleteMany({
          user_id: userId,
        });
      }
      // 刪除會員
      const deleteResult = await query(
        `delete from users where _id = ${userId}`
      );
      if (!deleteResult.protocol41) {
        return next(errorMessage(400, "delete failed"));
      }
      return successMessage(res, 204);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 取得已存文章
  getSaved: async (req, res, next) => {
    try {
      const userId = req.user._id;
      // 檢查 user 是否存在
      let searchResult = await query(
        `select _id,username from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 尋找已存文章
      const searchSave = await query(
        `select * from saves inner join articles on saves.article_id = articles._id where saves.user_id = ${userId} `
      );
      searchResult[0].saved = searchSave;
      return successMessage(res, 200, "get saved article", searchResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 儲存文章
  save: async (req, res, next) => {
    try {
      const articleId = req.params.article_id;
      const userId = req.user._id;
      // 檢查 user 是否存在
      let searchResult = await query(
        `select _id,username from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 檢查 article 是否存在
      const searchArticle = await query(
        `select _id,title from articles where _id = ${articleId}`
      );
      if (searchArticle.length == 0) {
        return next(errorMessage(400, "can not find article"));
      }
      // 儲存( mysql 有設定 unique 値)
      const saveResult = await query(
        `insert into saves(user_id, article_id) values(${userId},${articleId}) `
      );
      if (!saveResult.protocol41) {
        return next(errorMessage(400, "save failed"));
      }
      searchResult[0].save = searchArticle;
      return successMessage(res, 201, "saved article", searchResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 刪除已存文章
  deleteSave: async (req, res, next) => {
    try {
      const articleId = req.params.article_id;
      const userId = req.user._id;
      // 檢查 article 是否存在 save 中
      const searchSave = await query(
        `select * from saves where user_id = ${userId} and article_id = ${articleId}`
      );
      if (searchSave.length == 0) {
        return next(errorMessage(400, "the article is not in saved"));
      }
      // 不是本人不能刪除
      if (searchSave[0].user_id != userId) {
        return next(errorMessage(400, "You do not have permission to delete"));
      }
      const deleteSave = await query(
        `delete from saves where user_id = ${userId} and article_id = ${articleId}`
      );
      if (!deleteSave.protocol41) {
        return next(errorMessage(400, "delete failed"));
      }
      return successMessage(res, 204);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 取得已追蹤名単
  getFollowed: async (req, res, next) => {
    try {
      const userId = req.user._id;
      // 檢查 user 是否存在
      let searchResult = await query(
        `select _id,username from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 尋找 follow
      const followResult = await Follow.find({ user_id: userId });
      searchResult[0].follow = followResult;
      return successMessage(res, 200, "get follow", searchResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 追蹤
  follow: async (req, res, next) => {
    try {
      const followId = req.params.user_id;
      const userId = req.user._id;
      // 檢查 user 是否存在
      let searchResult = await query(
        `select _id,username from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can not find user"));
      }
      // 檢查 followId 是否存在
      const searchFollow = await query(
        `select _id,username from users where _id = ${followId}`
      );
      if (searchFollow.length == 0) {
        return next(errorMessage(400, "can not find follower"));
      }
      // 尋找 user 是否已有 follow
      const followResult = await Follow.find({
        user_id: userId,
        follower_id: followId,
      });
      // 有 follow，回傳錯誤
      if (followResult.length != 0) {
        return next(errorMessage(400, "you already follow the user"));
      }
      // 没有 follow 儲存
      const follow = await Follow.create({
        user_id: userId,
        follower_id: searchFollow[0]._id,
        follow_name: searchFollow[0].username,
      });
      searchResult[0].follow = follow;
      return successMessage(res, 201, "follow", searchResult[0]);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  // 刪除已追蹤
  deleteFollow: async (req, res, next) => {
    try {
      const followId = req.params.user_id;
      const userId = req.user._id;
      // 尋找 user 是否已有 follow
      const followResult = await Follow.find({
        user_id: userId,
        follower_id: followId,
      });
      // 沒有 follow，回傳錯誤
      if (followResult.length == 0) {
        return next(errorMessage(400, "you did not follow the user"));
      }
      // 不是本人不能刪除
      if (followResult[0].user_id != userId) {
        return next(errorMessage(400, "You do not have permission to delete"));
      }
      const deleteFollow = await Follow.deleteOne({
        user_id: userId,
        follower_id: followId,
      });
      if (!deleteFollow.acknowledged) {
        return next(errorMessage(400, "delete failed"));
      }
      return successMessage(res, 204);
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
};

module.exports = userController;
