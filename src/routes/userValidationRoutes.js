const userValidationRouter = require("express").Router()

const {
    validateUserRegistration,
    validateUserLogin
} = require('../middlewares/userValidationMiddleware')

const {
    register,
    login
} = require('../controllers/userValidationController')

userValidationRouter.post('/auth/register', validateUserRegistration, register)
userValidationRouter.post('/auth/login', validateUserLogin, login)

module.exports = userValidationRouter