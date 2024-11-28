const { Timestamp } = require('@google-cloud/firestore')
const db = require('../config/firestore')

const getAllProducts = async (req, res) => {
    try {
        const productSnapshot = await db.collection('products').get()

        if (productSnapshot.empty) {
            return res.status(404).json({
                status: 'error',
                message: 'No products found.',
                data: null
            })
        }
    
        let products = []
    
        productSnapshot.forEach(doc => {
            products.push({
                productId: doc.id,
                ...doc.data()
            })
        })
    
        return res.status(200).json({
            status: 'success',
            message: 'All product retrieved successfully.',
            data: products
        })
    } catch (error) {
        console.error("Error retrieving all product:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve all product due to server error.',
            data: null
        })
    }
}

const getProductById = async (req, res) => {
    const product = req.productSnapshot.data()

    return res.status(200).json({
        status: 'success',
        message: 'Product retrieved successfully.',
        data: product
    })
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
    try {
        const productId = req.params.productId
        
        await db.collection('products').doc(productId).update({
            ...req.body,
            updatedAt: Timestamp.now()
        })
    
        return res.status(200).json({
            status: 'success',
            message: 'Product updated successfully.',
            data: {
                productId: productId
            }
        })
    } catch (error) {
        console.error("Error updating product:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update product due to server error.',
            data: null
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId

        await db.collection('products').doc(productId).delete()

        return res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully.',
            data: null
        })
    } catch (error) {
        console.error("Error deleting product:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete product due to server error.',
            data: null
        })
    }
}

// log products

const createProductLog = async (req, res) => {
    try {
        const productId = req.params.productId

        const { stockIn, stockOut } = req.body

        const createdAt = Timestamp.now()

        if (stockIn) {
            await db.collection('inventoryLogs').add({
                productId,
                changeType: 'stockIn',
                stockChange: stockIn,
                createdAt
            })
        }
        
        if (stockOut) {
            await db.collection('inventoryLogs').add({
                productId,
                changeType: 'stockOut',
                stockChange: -1 * stockOut,
                createdAt
            })
        }

        const currentStockLevel = req.productSnapshot.data().stockLevel

        await db.collection('products').doc(productId).update({
            stockLevel: currentStockLevel + stockIn - stockOut,
            updatedAt: createdAt
        })

        return res.status(200).json({
            status: 'success',
            message: 'Product logged successfully.',
            data: {
                productId: productId
            }
        })
    } catch (error) {
        console.error("Error logging product:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to log product due to server error.',
            data: null
        })
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductLog
}
