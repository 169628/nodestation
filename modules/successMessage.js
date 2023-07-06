const successMessage = (res, status, action, data) => {
  return res.status(status).send({
    message: action + " success",
    data,
  });
};

module.exports = successMessage;
