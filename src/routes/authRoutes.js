const authRouter = require("express").Router()
const authMiddleware = require('../middlewares/authMiddleware')
const authController = require('../controllers/authController')

authRouter.post('/auth/register', authMiddleware.validateUserRegistration, authController.register)
authRouter.post('/auth/login', authMiddleware.validateUserLogin, authController.login)
authRouter.post('/auth/logout')

module.exports = authRouter