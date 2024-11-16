const router = require('express').Router()
const { validateUserUpdate, validateUserIdParam } = require('../middlewares/userMiddleware')
const { getUserById, updateUser } = require('../controllers/userController')

router.get('/users/:userId', validateUserIdParam, getUserById)
router.patch('/users/:userId', validateUserIdParam, validateUserUpdate, updateUser)

module.exports = router