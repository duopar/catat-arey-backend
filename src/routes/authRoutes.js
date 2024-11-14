const router = require("express").Router()
const { validateUserLogin, validateUserRegistration } = require('../middlewares/authMiddleware')
const authController = require('../controllers/authController')

router.post('/auth/register', validateUserRegistration, authController.register)

module.exports = router