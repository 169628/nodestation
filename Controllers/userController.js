const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const { query } = require("../connection/mysql");
const allValidation = require("../modules/validation");
const mailSender = require("../modules/mailSender");
const errorMessage = require("../modules/errorMessage");
const successMessage = require("../modules/successMessage");

const userController = {
  // 註冊
  register: async (req, res, next) => {
    const { name, mail } = req.body;
    // 檢查格式是否正確
    let { error } = allValidation.register({ name, mail });
    if (error) {
      return next(errorMessage(400, error.details[0].message, error));
    }

    try {
      // 檢查是否已註冊
      const searchResult = await query(
        `select * from users where email = "${mail}"`
      );

      // 註冊並寄送密碼
      if (searchResult.length == 0) {
        const password = uuidv4().substr(0, 6);
        let dbData = [name, mail];
        dbData[2] = await bcrypt.hash(password, 12);
        const insertResult = await query(
          "insert into users(username,email,password) values(?,?,?)",
          dbData
        );
        if (insertResult.insertId) {
          const data = {
            _id: insertResult.insertId,
            username: name,
            email: mail,
          };
          return mailSender(res, 201, mail, password, data, next);
        }
      }

      // 以 google 第三方登入的使用者
      if (searchResult[0].google_id != null) {
        return next(errorMessage(400, "please login with google"));
      }

      // 已註冊回傳錯誤
      return next(
        errorMessage(
          400,
          "This mail is already registered, please log in with this mail"
        )
      );
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
        return next(errorMessage(400, "can't find user"));
      }
      return successMessage(res, 200, "get info", searchResult[0]);
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

      const searchResult = await query(
        `select * from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can't find user"));
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
      const userId = req.user_id;
      // 確認是否有該使用者
      const searchResult = await query(
        `select * from users where _id = ${userId}`
      );
      if (searchResult.length == 0) {
        return next(errorMessage(400, "can't find user"));
      }
      // 不是本人不能刪
      if (searchResult[0]._id != userId) {
        return next(errorMessage(400, "You do not have permission to delete"));
      }
      // 刪除帳號
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
        return next(errorMessage(400, "can't find user"));
      }
      // 尋找已存文章
      const searchSave = await query(
        `select * from saves inner join articles on saves.article_id = articles._id where saves.user_id = ${userId} `
      );
      if (searchSave.length == 0) {
        return next(errorMessage(400, "can't find  any saved articles"));
      }
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
        return next(errorMessage(400, "can't find user"));
      }
      // 檢查 article 是否存在
      const searchArticle = await query(
        `select _id,title from articles where _id = ${articleId}`
      );
      if (searchArticle.length == 0) {
        return next(errorMessage(400, "can't find article"));
      }
      // 儲存
      const saveResult = await query(
        `insert into saves(user_id, article_id) values(${userId},${articleId}) `
      );
      if (!saveResult.protocol41) {
        return next(errorMessage(400, "save failed"));
      }
      searchResult[0].save = searchArticle;
      return successMessage(res, 200, "saved article", searchResult[0]);
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
};

module.exports = userController;
