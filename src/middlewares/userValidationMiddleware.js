const bcrypt = require('bcrypt');
const db = require('../config/firestore');
const Joi = require('joi');

const validateUserRegistration = async (req, res, next) => {
  try {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string()
        .pattern(
          new RegExp(
            '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,30}$'
          )
        )
        .required()
        .messages({
          'string.pattern.base':
            '"password" must be between 8-30 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': '"confirmPassword" must match "password"',
        }),
      role: Joi.string().valid('owner', 'employee').required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
        data: null,
      });
    }

    const { username } = req.body;

    const userSnapshot = await db
      .collection('users')
      .where('username', '==', username)
      .get();

    if (!userSnapshot.empty) {
      return res.status(409).json({
        status: 'error',
        message: 'Username already exists.',
        data: null,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Registration failed due to server error.',
      data: null,
    });
  }
};

const validateUserLogin = async (req, res, next) => {
  try {
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
        data: null,
      });
    }

    const { username, password } = req.body;

    const userSnapshot = await db
      .collection('users')
      .where('username', '==', username)
      .get();

    if (userSnapshot.empty) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid "username" or "password".',
        data: null,
      });
    }

    const userPassword = userSnapshot.docs[0].data().password;

    if (!(await bcrypt.compare(password, userPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid "username" or "password".',
        data: null,
      });
    }

    const userId = userSnapshot.docs[0].id;
    const role = userSnapshot.docs[0].data().role;

    req.userData = {
      userId,
      username,
      role,
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Login failed due to server error.',
      data: null,
    });
  }
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
};
