const userValidationRouter = require('express').Router();

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
userValidationRouter.post('/refresh', refresh);

module.exports = userValidationRouter;
