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

const createInventoryLogFromHistory = async (req, res) => {
  try {
    const historyLogs = req.body;

    //  TODO: cek apakah setiap nama data history sudah berada pada koleksi products
    //  TODO: jika iya, ambil id dari produk tersebut
    //  TODO: jika belum, tambahkan produk tersebut ke koleksi products, lalu ambil idnya
    //  TODO: masukkan setiap data history tersebut ke koleksi inventoryLogs

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
        productSnapshot.forEach((doc) => {
          productId = doc.id;
        });
      } else {
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

    await batch.commit();

    return res.status(201).json({
      status: 'success',
      message: 'Histories logged successfully.',
      data: null,
    });
  } catch (error) {
    console.error('Error logging histories:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to log histories due to server error.',
      data: null,
    });
  }
};

module.exports = { createInventoryLog, createInventoryLogFromHistory };
