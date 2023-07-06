const nodemailer = require("nodemailer");

const errorMessage = require("./errorMessage");
const successMessage = require("./successMessage");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const mailSender = (res, status, mail, password, data, next) => {
  transporter.sendMail(
    {
      to: mail,
      subject: "Joke Station 登入密碼",
      html: `<p>請以以下密碼登入網站後，再編輯個人資訊修改密碼</p>
        <p>登入密碼: ${password}</p>`,
    },
    (err, info) => {
      if (err) {
        return next(errorMessage(500, "Server error"));
      }
      return successMessage(res, status, "send mail", data);
    }
  );
};

module.exports = mailSender;
