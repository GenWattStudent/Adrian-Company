import Joi from 'joi'

const registerValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .regex(/[a-zA-Z0-9]{3,30}/, 'password')
      .required(),
    username: Joi.string().alphanum().min(3).max(25).required(),
  }),
}

export default registerValidation
