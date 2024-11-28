const productRouter = require('express').Router()

const {
    validateUserRole,
    validateCreateProduct,
    validateProductIdParam,
    validateUpdateProduct,
    validateCreateProductLog
} = require('../middlewares/productMiddleware')

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductLog
} = require('../controllers/productController')

productRouter.get('/', getAllProducts)
productRouter.get('/:productId', validateProductIdParam, getProductById)
productRouter.post('/', validateUserRole, validateCreateProduct, createProduct)
productRouter.put('/:productId', validateUserRole, validateProductIdParam, validateUpdateProduct, updateProduct)
productRouter.delete('/:productId', validateUserRole, validateProductIdParam, deleteProduct)

// log products

productRouter.get('/:productId/logs')
productRouter.post('/:productId/logs', validateProductIdParam, validateCreateProductLog, createProductLog)
 

module.exports = productRouter
