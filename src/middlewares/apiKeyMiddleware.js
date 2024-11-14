const apiKeyMiddleware = (req, res, next) => {
    const userApiKey = req.headers['x-api-key']

    if (userApiKey && userApiKey === process.env.API_KEY) {
        next()
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Invalid API key.',
            data: null
        })
    }
}

module.exports = apiKeyMiddleware