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

module.exports = validateUserApiKey