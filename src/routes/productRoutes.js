const router = require('express').Router()
const { validateCreateProduct, validateProductIdParam } = require('../middlewares/productMiddleware')
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')

router.get('/products', getAllProducts)
router.get('/products/:productId', validateProductIdParam, getProductById)
router.post('/products', validateCreateProduct, createProduct)

module.exports = router