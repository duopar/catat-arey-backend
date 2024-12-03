const userValidationRouter = require('express').Router();

const {
  validateUserRegistration,
  validateUserLogin,
} = require('../middlewares/userValidationMiddleware');

const { register, login } = require('../controllers/userValidationController');

userValidationRouter.post('/register', validateUserRegistration, register);
userValidationRouter.post('/login', validateUserLogin, login);

module.exports = userValidationRouter;
