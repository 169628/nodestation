const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const { query } = require("../connection/mysql");
const allValidation = require("../modules/validation");
const mailSender = require("../modules/mailSender");
const errorMessage = require("../modules/errorMessage");
const jwtToken = require("../modules/jwtToken");

const authController = {
  // 登入
  login: async (req, res, next) => {
    const { mail, password } = req.body;
    // 檢查格式是否正確
    let { error } = allValidation.login({ mail, password });
    if (error) {
      return next(errorMessage(400, error.details[0].message, error));
    }
    try {
      // 檢查是否已註冊
      const searchResult = await query(
        `select * from users where email = "${mail}"`
      );
      // 未註冊回傳錯誤
      if (searchResult.length == 0) {
        return next(
          errorMessage(
            400,
            "This mail has not been registered yet, please register"
          )
        );
      }
      // 檢查密碼
      const check = await bcrypt.compare(password, searchResult[0].password);
      if (!check) {
        return next(errorMessage(400, "wrong password"));
      }
      // 寄送 token
      return jwtToken.sendToken(
        {
          _id: searchResult[0]._id,
          username: searchResult[0].username,
        },
        200,
        res
      );
    } catch (err) {
      return next(errorMessage(500, "login failed", err));
    }
  },
  // 忘記密碼
  forgetPassword: async (req, res, next) => {
    const { mail } = req.body;
    // 檢查格式是否正確
    let { error } = allValidation.forgetPassword({ mail });
    if (error) {
      return next(errorMessage(400, error.details[0].message, error));
    }

    try {
      // 檢查是否已註冊
      const searchResult = await query(
        `select * from users where email = "${mail}"`
      );
      // 未註冊回傳錯誤
      if (searchResult.length == 0) {
        return next(
          errorMessage(
            400,
            "This mail has not been registered yet, please register"
          )
        );
      }
      // 以 google 第三方登入的使用者
      if (searchResult[0].google_id != null) {
        return next(errorMessage(400, "please login with google"));
      }
      // 修改並寄送新密碼
      const password = uuidv4().substr(0, 6);
      const dbData = await bcrypt.hash(password, 12);
      const updateResult = await query(
        `update users set password = "${dbData}"  where _id = ${searchResult[0]._id}`
      );
      if (updateResult.protocol41) {
        return mailSender(res, 201, mail, password, mail, next);
      }
    } catch (err) {
      return next(errorMessage(500, "Server error", err));
    }
  },
  googleCallback: (req, res, next) => {
    jwtToken.sendToken(req.user, 200, res, next);
  },
};

module.exports = authController;
