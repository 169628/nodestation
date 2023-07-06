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
  getUserInfo: async (req, res, next) => {
    let userId;
    try {
      // 確認 token 是否為本人
      if (req.params.user_id == req.user._id) {
        userId = req.params.user_id;
        const searchResult = await query(
          `select _id, username, email, about_me from users where _id = ${userId}`
        );
        return successMessage(res, 200, "get info", searchResult[0]);
      }
      // token 非本人回傳錯誤
      return next(errorMessage(400, "please login"));
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
};

module.exports = userController;
