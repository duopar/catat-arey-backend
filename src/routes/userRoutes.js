const userRouter = require('express').Router()

const {
    validateUserUpdate,
    validateUserIdParam
} = require('../middlewares/userMiddleware')

const {
    getUserById,
    updateUser
} = require('../controllers/userController')

userRouter.get('/:userId', validateUserIdParam, getUserById)
userRouter.patch('/:userId', validateUserIdParam, validateUserUpdate, updateUser)

module.exports = userRouter