const Joi = require('joi');
const bcrypt = require('bcrypt');
const db = require('../config/firestore');

const validateUserIdParam = async (req, res, next) => {
  const userId = req.params.userId;
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return res.status(404).json({
      status: 'error',
      message: 'No user found with the provided ID.',
      data: null,
    });
  }

  next();
};

const validateUserUpdate = async (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .pattern(
        new RegExp(
          '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,30}$'
        )
      )
      .required()
      .messages({
        'string.pattern.base':
          '"newPassword" must be between 8-30 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': '"confirmPassword" must match "newPassword"',
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
      data: null,
    });
  }

  const userId = req.params.userId;
  const decodedUserId = req.decodedUserToken.userId;

  if (userId !== decodedUserId) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot change password for another user.',
      data: null,
    });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    const userData = (await db.collection('users').doc(userId).get()).data();
    const userPassword = userData.password;

    if (!(await bcrypt.compare(currentPassword, userPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid "currentPassword".',
        data: null,
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    req.hashedNewPassword = hashedNewPassword;

    next();
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update password due to server error.',
      data: null,
    });
  }
};

module.exports = {
  validateUserUpdate,
  validateUserIdParam,
};
