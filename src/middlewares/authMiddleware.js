const jwt = require('jsonwebtoken')
const getSecret = require('../config/secretManager')

let API_KEY = null
getSecret('API_KEY').then(secret => API_KEY = secret)

let JWT_SECRET = null
getSecret('JWT_SECRET').then(secret => JWT_SECRET = secret)

const validateUserApiKey = async (req, res, next) => {
    const userApiKey = req.headers['x-api-key']

    if (!userApiKey) {
        return res.status(401).json({
            status: 'error',
            message: 'No API key provided. Authorization required.',
            data: null
        })
    }

    if (userApiKey !== API_KEY) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid API key.',
            data: null
        })
    }
    
    next()
}

const validateUserToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({
            status: 'error',
            message: 'Authorization header missing.',
            data: null
        })
    }

    const [ bearer, userToken ] = authHeader.split(' ')

    if (bearer !== 'Bearer') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token format. Use "Bearer <your-token>"',
            data: null
        })
    }

    if (!userToken) {
        return res.status(401).json({
            status: 'error',
            message: 'No token provided. Authorization required.',
            data: null
        })
    }

    try {
        const decodedUserToken = jwt.verify(userToken, JWT_SECRET)

        req.decodedUserToken = decodedUserToken

        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token has expired.',
                data: null
            })
        }

        return res.status(401).json({
            status: 'error',
            message: 'Invalid token.',
            data: null
        })
    }
}

module.exports = { 
    validateUserApiKey, 
    validateUserToken 
}