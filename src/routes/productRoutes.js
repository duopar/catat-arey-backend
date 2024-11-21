const productRouter = require('express').Router()

const {
    validateUserRole,
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

productRouter.get('/', getAllProducts)
productRouter.get('/:productId', validateProductIdParam, getProductById)
productRouter.post('/', validateUserRole, validateCreateProduct, createProduct)
productRouter.put('/:productId', validateUserRole, validateProductIdParam, validateUpdateProduct, updateProduct)
productRouter.delete('/:productId', validateUserRole, validateProductIdParam, deleteProduct)

module.exports = productRouter