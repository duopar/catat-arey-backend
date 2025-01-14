const { Timestamp } = require('@google-cloud/firestore');
const db = require('../config/firestore');

const createInventoryLog = async (req, res) => {
  try {
    const { productId, stockIn, stockOut } = req.body;

    const createdAt = Timestamp.now();

    if (stockIn) {
      await db.collection('inventoryLogs').add({
        productId,
        changeType: 'stockIn',
        stockChange: stockIn,
        createdAt,
      });
    }

    if (stockOut) {
      await db.collection('inventoryLogs').add({
        productId,
        changeType: 'stockOut',
        stockChange: stockOut,
        createdAt,
      });
    }

    // product snapshot from validateCreateInventoryLog middleware
    const currentStockLevel = req.productSnapshot.data().stockLevel;

    await db
      .collection('products')
      .doc(productId)
      .update({
        stockLevel: currentStockLevel + stockIn - stockOut,
        updatedAt: createdAt,
      });

    return res.status(201).json({
      status: 'success',
      message: 'Product logged successfully.',
      data: {
        productId: productId,
      },
    });
  } catch (error) {
    console.error('Error logging product:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to log product due to server error.',
      data: null,
    });
  }
};

module.exports = { createInventoryLog };
