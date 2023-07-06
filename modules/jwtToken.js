const jwt = require("jsonwebtoken");

const errorMessage = require("./errorMessage");
const successMessage = require("./successMessage");

const jwtToken = {
  sendToken: (userData, statusCode, res, next) => {
    try {
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY,
      });
      return successMessage(res, statusCode, "login", {
        token: "Bearer " + token,
        userData,
      });
    } catch (err) {
      return next(errorMessage(500, "Server error"));
    }
  },
  checkToken: async (req, res, next) => {
    // 確認 token 是否存在
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      // 驗證 token 正確性
      await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
          if (err) {
            return next(errorMessage(500, "please login"));
          } else {
            req.user = payload;
            return next();
          }
        });
      });
    }
    return next(errorMessage(400, "please login"));
  },
};

module.exports = jwtToken;
