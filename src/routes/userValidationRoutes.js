const userValidationrouter = require("express").Router()

const {
    validateUserRegistration,
    validateUserLogin
} = require('../middlewares/userValidationMiddleware')

const {
    register,
    login
} = require('../controllers/userValidationController')

userValidationrouter.post('/auth/register', validateUserRegistration, register)
userValidationrouter.post('/auth/login', validateUserLogin, login)

module.exports = userValidationrouter