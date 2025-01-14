const joi = require('joi');
const db = require('../config/firestore');

const validateCreateInventoryLog = async (req, res, next) => {
  const schema = joi
    .object({
      productId: joi.string().required(),
      stockIn: joi.number().integer().strict().min(0).required(),
      stockOut: joi.number().integer().strict().min(0).required(),
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

  const { productId, stockIn, stockOut } = req.body;

  const productSnapshot = await db.collection('products').doc(productId).get();

  if (!productSnapshot.exists) {
    return res.status(404).json({
      status: 'error',
      message: 'No product found with the provided ID.',
      data: null,
    });
  }

  const currentStockLevel = productSnapshot.data().stockLevel;

  if (stockOut > currentStockLevel + stockIn) {
    return res.status(400).json({
      status: 'error',
      message:
        '"stockOut" must be less than or equal to the current product\'s "stockLevel".',
      data: null,
    });
  }

  req.productSnapshot = productSnapshot;

  next();
};

module.exports = { validateCreateInventoryLog };
