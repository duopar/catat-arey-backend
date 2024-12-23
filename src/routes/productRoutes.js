const productRouter = require('express').Router();

const {
  validateUserRole,
  validateProductQueryParam,
  validateProductIdParam,
  validateCreateOrUpdateProduct,
  validateCreateProductLog,
} = require('../middlewares/productMiddleware');

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductLog,
} = require('../controllers/productController');

productRouter.get('/', validateProductQueryParam, getAllProducts);
productRouter.get('/:productId', validateProductIdParam, getProductById);
productRouter.post(
  '/',
  validateUserRole,
  validateCreateOrUpdateProduct,
  createProduct
);
productRouter.put(
  '/:productId',
  validateUserRole,
  validateProductIdParam,
  validateCreateOrUpdateProduct,
  updateProduct
);
productRouter.delete(
  '/:productId',
  validateUserRole,
  validateProductIdParam,
  deleteProduct
);
// log products
productRouter.post(
  '/:productId/logs',
  validateProductIdParam,
  validateCreateProductLog,
  createProductLog
);

module.exports = productRouter;
