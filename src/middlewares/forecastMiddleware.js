const db = require('../config/firestore');

const getInventoryLogs = async (req, res, next) => {
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
      const wibTime = doc.data().createdAt.toDate().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      inventoryLogs.push({
        inventoryLogId: doc.id,
        ...doc.data(),
        createdAt: wibTime,
      });
    });

    req.inventoryLogs = inventoryLogs;

    next();
  } catch (error) {
    console.error('Error retrieving inventory logs:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve inventory logs due to server error.',
      data: null,
    });
  }
};

module.exports = { getInventoryLogs };
