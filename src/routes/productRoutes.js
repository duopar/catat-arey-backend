const router = require('express').Router()
const { validateCreateProduct } = require('../middlewares/productMiddleware')
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')

router.get('/products', getAllProducts)
router.post('/products', validateCreateProduct, createProduct)

module.exports = router