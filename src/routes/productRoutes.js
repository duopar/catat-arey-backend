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

productRouter.get('/', getAllProducts)
productRouter.get('/:productId', validateProductIdParam, getProductById)
productRouter.post('/', validateCreateProduct, createProduct)
productRouter.put('/:productId', validateProductIdParam, validateUpdateProduct, updateProduct)
productRouter.delete('/:productId', validateProductIdParam, deleteProduct)

module.exports = productRouter