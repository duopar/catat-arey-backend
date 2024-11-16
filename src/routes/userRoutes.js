const userRouter = require('express').Router()

const {
    validateUserUpdate,
    validateUserIdParam
} = require('../middlewares/userMiddleware')

const {
    getUserById,
    updateUser
} = require('../controllers/userController')

userRouter.get('/users/:userId', validateUserIdParam, getUserById)
userRouter.patch('/users/:userId', validateUserIdParam, validateUserUpdate, updateUser)

module.exports = userRouter