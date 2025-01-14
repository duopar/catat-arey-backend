const productRouter = require('express').Router();

const {
  validateUserRole,
  validateProductQueryParam,
  validateProductIdParam,
  validateCreateOrUpdateProduct,
} = require('../middlewares/productMiddleware');

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
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

module.exports = productRouter;
