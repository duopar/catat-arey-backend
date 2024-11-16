const { Timestamp } = require('@google-cloud/firestore')
const db = require('../config/firestore')

const getAllProducts = async (req, res) => {
    const productSnapshot = await db.collection('products').get()

    products = []

    productSnapshot.forEach(doc => {
        products.push({
            productId: doc.id,
            ...doc.data()
        })
    })

    return res.status(200).json({
        status: 'success',
        message: 'Product retrieved successfully.',
        data: products
    })
}

const getProductById = async (req, res) => {

}

const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            stockLevel,
            restockThreshold
        } = req.body
    
        const productRef = await db.collection('products').add({
            name,
            category,
            price,
            stockLevel,
            restockThreshold,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        })
    
        return res.status(200).json({
            status: 'success',
            message: 'Product created successfully.',
            data: {
                productId: productRef.id
            }
        })
    } catch (error) {
        console.error("Error creating product:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create product due to server error.',
            data: null
        })
    }
}

const updateProduct = async (req, res) => {

}

const deleteProduct = async (req, res) => {

}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}