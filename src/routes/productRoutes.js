const router = require('express').Router()
const { validateCreateProduct, validateProductIdParam, validateUpdateProduct } = require('../middlewares/productMiddleware')
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
router.put('/products/:productId', validateProductIdParam, validateUpdateProduct, updateProduct)

module.exports = router