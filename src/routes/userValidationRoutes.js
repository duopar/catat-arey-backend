const userValidationRouter = require('express').Router();

const {
  validateUserRefreshToken,
} = require('../middlewares/authMiddleware.js');

const {
  validateUserRegistration,
  validateUserLogin,
} = require('../middlewares/userValidationMiddleware');

const {
  register,
  login,
  refresh,
} = require('../controllers/userValidationController');

userValidationRouter.post('/register', validateUserRegistration, register);
userValidationRouter.post('/login', validateUserLogin, login);
userValidationRouter.post('/refresh', validateUserRefreshToken, refresh);

module.exports = userValidationRouter;
