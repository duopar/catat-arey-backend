const joi = require('joi');
const db = require('../config/firestore');

const validateUserRole = (req, res, next) => {
  const decodedUserRole = req.decodedUserToken.role;
  console.log(decodedUserRole)

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

const validateCreateProduct = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    category: joi.string().required(),
    price: joi.number().integer().strict().required(),
    stockLevel: joi.number().integer().strict().required(),
    restockThreshold: joi.number().integer().strict().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
      data: null,
    });
  }

  const { name } = req.body;

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

  next();
};

const validateUpdateProduct = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string(),
    category: joi.string(),
    price: joi.number().integer().strict(),
    stockLevel: joi.number().integer().strict(),
    restockThreshold: joi.number().integer().strict(),
  });

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

const validateCreateProductLog = async (req, res, next) => {
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
  validateProductIdParam,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateProductLog,
};
