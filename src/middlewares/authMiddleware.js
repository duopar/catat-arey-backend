const jwt = require('jsonwebtoken')

const validateUserApiKey = (req, res, next) => {
    const userApiKey = req.headers['x-api-key']

    if (userApiKey && userApiKey === process.env.API_KEY) {
        next()
    } else {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid API key.',
            data: null
        })
    }
}

const validateUserToken = (req, res, next) => {
    const userToken = req.headers['authorization'] //.split(' ')[1]

    if (!userToken) {
        return res.status(401).json({
            status: 'error',
            message: 'No token provided. Authorization required.',
            data: null
        })
    }

    try {
        const decodedUserToken = jwt.verify(userToken, process.env.JWT_SECRET)

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