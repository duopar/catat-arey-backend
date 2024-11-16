const router = require('express').Router()
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')

router.post('/products', createProduct)

module.exports = router