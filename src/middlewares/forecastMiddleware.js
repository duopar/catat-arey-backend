const db = require('../config/firestore');

const getProducts = async (req, res, next) => {
  let productSnapshot = await db.collection('products').get();

  const { productId } = req.query;

  let products = {};

  if (productId) {
    productSnapshot.docs.forEach((doc) => {
      if (doc.id === productId) {
        products[doc.id] = doc.data();
      }
    });
  } else {
    productSnapshot.docs.forEach((doc) => {
      products[doc.id] = doc.data();
    });
  }

  if (Object.keys(products).length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'No products found.',
      data: null,
    });
  }

  //console.log(products);

  req.products = products;

  next();
};

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
    //console.log(inventoryLogs);

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

module.exports = { getInventoryLogs, getProducts };
