const joi = require('joi');
const db = require('../config/firestore');

const validateUserRole = (req, res, next) => {
  // decoded jwt token from validateUserToken middleware
  const decodedUserRole = req.decodedUserAccessToken.role;

  if (decodedUserRole !== 'owner') {
    return res.status(401).json({
      status: 'error',
      message:
        'Only users with the "owner" role are authorized to add, update, or delete products.',
      data: null,
    });
  }

  next();
};

const validateProductQueryParam = (req, res, next) => {
  const validParams = ['name'];

  for (const param of Object.keys(req.query)) {
    if (!validParams.includes(param)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid query parameter: "${param}".`,
        data: null,
      });
    }
  }

  next();
};

const validateProductIdParam = async (req, res, next) => {
  const productId = req.params.productId;
  const productSnapshot = await db.collection('products').doc(productId).get();

  if (!productSnapshot.exists) {
    return res.status(404).json({
      status: 'error',
      message: 'No product found with the provided ID.',
      data: null,
    });
  }

  req.productSnapshot = productSnapshot;

  next();
};

const validateCreateOrUpdateProduct = async (req, res, next) => {
  let schema;

  if (!req.params.productId) {
    // create product
    schema = joi.object({
      name: joi.string().required(),
      category: joi.string().required(),
      price: joi.number().integer().strict().required(),
      stockLevel: joi.number().integer().strict().required(),
      restockThreshold: joi.number().integer().strict().required(),
    });
  } else {
    // update product
    schema = joi.object({
      name: joi.string(),
      category: joi.string(),
      price: joi.number().integer().strict(),
      stockLevel: joi.number().integer().strict(),
      restockThreshold: joi.number().integer().strict(),
    });
  }

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
      data: null,
    });
  }

  const { name } = req.body;

  if (name) {
    const productSnapshot = await db
      .collection('products')
      .where('name', '==', name)
      .get();

    if (!productSnapshot.empty) {
      return res.status(409).json({
        status: 'error',
        message: 'Product already exists.',
        data: null,
      });
    }
  }

  next();
};

const validateCreateProductLog = (req, res, next) => {
  // product snapshot from validateProductIdParam middleware
  const currentStockLevel = req.productSnapshot.data().stockLevel;

  const schema = joi
    .object({
      stockIn: joi.number().integer().strict().min(0).required(),
      stockOut: joi
        .number()
        .integer()
        .strict()
        .min(0)
        .max(currentStockLevel)
        .required()
        .messages({
          'number.max':
            '"stockOut" must be less than or equal to the current product\'s "stockLevel".',
        }),
    })
    .custom((value, helpers) => {
      const { stockIn, stockOut } = value;

      if (stockIn === 0 && stockOut === 0) {
        return helpers.message(
          '"stockIn" and "stockOut" cannot both be 0 at the same time.'
        );
      }

      return value;
    });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
      data: null,
    });
  }

  next();
};

module.exports = {
  validateUserRole,
  validateProductQueryParam,
  validateProductIdParam,
  validateCreateOrUpdateProduct,
  validateCreateProductLog,
};
