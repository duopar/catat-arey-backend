const router = require('express').Router()
const { getUserById } = require('../controllers/userController')

router.get('/users/:id', getUserById)
router.put('/users/:id')

module.exports = router