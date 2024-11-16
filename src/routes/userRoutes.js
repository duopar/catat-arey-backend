const router = require('express').Router()
const validateUserUpdate = require('../middlewares/userMiddleware')
const { getUserById, updateUser } = require('../controllers/userController')

router.get('/users/:userId', getUserById)
router.patch('/users/:userId', validateUserUpdate, updateUser)

module.exports = router