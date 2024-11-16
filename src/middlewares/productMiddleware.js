const joi = require('joi')
const db = require('../config/firestore')

const validateProductIdParam = async (req, res, next) => {
    const productId = req.params.productId
    const productSnapshot = await db.collection('products').doc(productId).get()

    if (!productSnapshot.exists) {
        return res.status(404).json({
            status: 'error',
            message: 'No product found with the provided ID.',
            data: null
        })
    }

    next()
}

const validateCreateProduct = async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().required(),
        category: joi.string().required(),
        price: joi.number().strict().required(),
        stockLevel: joi.number().strict().required(),
        restockThreshold: joi.number().strict().required(),
    })

    const { error } = schema.validate(req.body)

    if (error) {
        return res.status(400).json({
            status: 'error',
            message: error.details[0].message,
            data: null
        })
    }

    const { name } = req.body
    const productSnapshot = await db.collection('products').where("name", "==", name).get()

    if (!productSnapshot.empty) {
        return res.status(400).json({
            status: 'error',
            message: 'Product already exists.',
            data: null
        })
    }

    next()
}

const validateUpdateProduct = async (req, res, next) => {

}

const validateDeleteProduct = async (req, res, next) => {

}

module.exports = {
    validateProductIdParam,
    validateCreateProduct
}