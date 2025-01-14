const { Timestamp } = require('@google-cloud/firestore');
const db = require('../config/firestore');

const getAllProducts = async (req, res) => {
  try {
    let productSnapshot = await db.collection('products').get();

    let products = [];

    const { name } = req.query;

    if (name) {
      productSnapshot = productSnapshot.docs.filter((doc) => {
        const productName = doc.data().name.toLowerCase();
        return productName.includes(name.toLowerCase());
      });
    }

    productSnapshot.forEach((doc) => {
      products.push({
        productId: doc.id,
        ...doc.data(),
      });
    });

    if (products.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No products found.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'All products retrieved successfully.',
      data: products,
    });
  } catch (error) {
    console.error('Error retrieving all products:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve all products due to server error.',
      data: null,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;

    // product snapshot from validateProductIdParam middleware
    const product = req.productSnapshot.data();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    // query the inventoryLog collection to determine the total stock inflow and outflow for the product today
    const inventoryLogSnapshot = await db
      .collection('inventoryLogs')
      .where('productId', '==', productId)
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .get();

    let stockInToday = 0;
    let stockOutToday = 0;

    if (!inventoryLogSnapshot.empty) {
      inventoryLogSnapshot.forEach((doc) => {
        if (doc.data().changeType === 'stockIn') {
          stockInToday += doc.data().stockChange;
        } else {
          stockOutToday += doc.data().stockChange;
        }
      });
    }

    // add stockInToday and stockOutToday from the inventoryLog collection to the product object
    product.stockInToday = stockInToday;
    product.stockOutToday = stockOutToday;

    return res.status(200).json({
      status: 'success',
      message: 'Product retrieved successfully.',
      data: product,
    });
  } catch (error) {
    console.error('Error retrieving the product:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve the product due to server error.',
      data: null,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stockLevel, restockThreshold } = req.body;

    const productRef = await db.collection('products').add({
      name,
      category,
      price,
      stockLevel,
      restockThreshold,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully.',
      data: {
        productId: productRef.id,
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create product due to server error.',
      data: null,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    await db
      .collection('products')
      .doc(productId)
      .update({
        ...req.body,
        updatedAt: Timestamp.now(),
      });

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully.',
      data: {
        productId: productId,
      },
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product due to server error.',
      data: null,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    await db.collection('products').doc(productId).delete();

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully.',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product due to server error.',
      data: null,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
