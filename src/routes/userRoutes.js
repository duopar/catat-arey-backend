const router = require('express').Router()
const userController = require('../controllers/userController')
const { validateUserToken } = require('../middlewares/authMiddleware')

router.get('/users/:id', validateUserToken, userController.getUserById)

module.exports = router