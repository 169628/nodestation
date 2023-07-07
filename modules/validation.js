const Joi = require("joi");

const allValidation = {
  register: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(1).max(40).required(),
      mail: Joi.string().email().max(100).required(),
    });
    return schema.validate(data);
  },
  login: (data) => {
    const schema = Joi.object({
      mail: Joi.string().email().max(100).required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9!@#&%_]{6,20}$"))
        .required(),
    });
    return schema.validate(data);
  },
  forgetPassword: (data) => {
    const schema = Joi.object({
      mail: Joi.string().email().max(100).required(),
    });
    return schema.validate(data);
  },
  update: (data) => {
    const schema = Joi.object({
      name: Joi.string().max(40),
      mail: Joi.string().email().max(100),
      password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9!@#&%_]{6,20}$")),
      repeatPassword: Joi.ref("password"),
      aboutMe: Joi.string().max(300),
    });
    return schema.validate(data);
  },
};

module.exports = allValidation;
