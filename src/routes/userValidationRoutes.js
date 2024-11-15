const router = require("express").Router()
const { validateUserRegistration, validateUserLogin } = require('../middlewares/userValidationMiddleware')
const { register, login } = require('../controllers/userValidationController')

router.post('/auth/register', validateUserRegistration, register)
router.post('/auth/login', validateUserLogin, login)

module.exports = router