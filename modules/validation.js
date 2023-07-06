const Joi = require("joi");

const allValidation = {
  register: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(1).max(50).required(),
      mail: Joi.string().email().required(),
    });
    return schema.validate(data);
  },
  login: (data) => {
    const schema = Joi.object({
      mail: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9!@#&%_]{6,20}$"))
        .required(),
    });
    return schema.validate(data);
  },
  forgetPassword: (data) => {
    const schema = Joi.object({
      mail: Joi.string().email().required(),
    });
    return schema.validate(data);
  },
  update: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(1).max(50).required(),
      mail: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9!@#&%_]{6,20}$"))
        .required(),
      repeatPassword: Joi.ref("password"),
    });
    return schema.validate(data);
  },
};

module.exports = allValidation;
