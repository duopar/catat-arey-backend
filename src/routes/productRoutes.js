const productRouter = require('express').Router()

const {
    validateCreateProduct,
    validateProductIdParam,
    validateUpdateProduct
} = require('../middlewares/productMiddleware')

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')

productRouter.get('/products', getAllProducts)
productRouter.get('/products/:productId', validateProductIdParam, getProductById)
productRouter.post('/products', validateCreateProduct, createProduct)
productRouter.put('/products/:productId', validateProductIdParam, validateUpdateProduct, updateProduct)
productRouter.delete('/products/:productId', validateProductIdParam, deleteProduct)

module.exports = productRouter