var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("./modules/passport");
const pageRouter = require("./routes/index");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const articleRouter = require("./routes/article");

const mongoosedb = require("./connection/mongoose");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 所有頁面
app.use("/", pageRouter);
// 所有 api
app.use("/api/user", userRouter);
app.use("/api", authRouter);
app.use("/api/article", articleRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // only providing error data in development
  process.env.NODE_ENV === "dev" ? err.message : (err.message = {});
  res.status(err.status || 500).send(err.message);
});

module.exports = app;
