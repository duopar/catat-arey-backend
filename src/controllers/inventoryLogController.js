const { Timestamp } = require('@google-cloud/firestore');
const db = require('../config/firestore');

const getInventoryLogs = async (req, res) => {
  try {
    const { productId } = req.query;

    let inventoryLogSnapshot = null;

    if (productId) {
      inventoryLogSnapshot = await db
        .collection('inventoryLogs')
        .where('productId', '==', productId)
        .get();
    } else {
      inventoryLogSnapshot = await db.collection('inventoryLogs').get();
    }

    if (inventoryLogSnapshot.empty) {
      return res.status(404).json({
        status: 'error',
        message: 'No inventory logs found.',
        data: null,
      });
    }

    let inventoryLogs = [];

    inventoryLogSnapshot.forEach((doc) => {
      inventoryLogs.push({
        inventoryLogId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      status: 'success',
      message: 'Inventory logs retrieved successfully.',
      data: inventoryLogs,
    });
  } catch (error) {
    console.error('Error retrieving inventory logs:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve inventory logs due to server error.',
      data: null,
    });
  }
};

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

const createInventoryLogFromHistory = async (req, res) => {
  try {
    const historyLogs = req.body;
    const batch = db.batch();
    const inventoryLogRef = db.collection('inventoryLogs');

    for (const log of historyLogs) {
      let productId = null;
      const name = log.product;
      const productSnapshot = await db
        .collection('products')
        .where('name', '==', name)
        .get();

      if (!productSnapshot.empty) {
        // check if history data name exists in products, then get its ID
        productId = productSnapshot.docs[0].id;
      } else {
        // if not, add the product to products and get its ID
        const productRef = await db.collection('products').add({
          name,
          category: 'pokok',
          price: 9999,
          stockLevel: 9999,
          restockThreshold: 9999,
          createdAt: Timestamp.fromDate(new Date(log.createdAt)),
          updatedAt: Timestamp.fromDate(new Date(log.createdAt)),
        });
        productId = productRef.id;
      }

      let logRef = inventoryLogRef.doc();
      batch.set(logRef, {
        productId,
        changeType: 'stockOut',
        createdAt: Timestamp.fromDate(new Date(log.createdAt)),
        stockChange: log.stockOut,
      });
    }

    // insert history data into inventoryLogs
    await batch.commit();

    return res.status(201).json({
      status: 'success',
      message: 'History data logged successfully.',
      data: null,
    });
  } catch (error) {
    console.error('Error logging history data:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to log history data due to server error.',
      data: null,
    });
  }
};

module.exports = {
  getInventoryLogs,
  createInventoryLog,
  createInventoryLogFromHistory,
};
