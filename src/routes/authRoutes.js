const router = require("express").Router()
const authController = require('../controllers/authController')

router.post('/auth/register', authController.register)

module.exports = router