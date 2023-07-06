const errorMessage = (status, message, err) => {
  const error = new Error();
  const orignalErr = err || "none";
  error.status = status;
  error.message = message + "\n錯誤詳細描述" + orignalErr;
  return error;
};

module.exports = errorMessage;
