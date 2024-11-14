const db = require('../config/firestore')

const validateUserRegistration = async (req, res, next) => {
    try {
        const { username, password, confirmPassword } = req.body

        if (!username || !password || !confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: username, password, or confirmPassword',
                data: null
            })
        }
    
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Password and confirmPassword do not match.',
                data: null
            })
        }
    
        const userQuery = await db.collection('users').where('username', '==', username).get()

        if (!userQuery.empty) {
            return res.status(400).json({
                status: 'error',
                message: 'Username already exists.',
                data: null
            })
        }

        next()
    } catch (error) {
        console.error("Error querying data:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Registration failed due to server error: error querying data.',
            data: null
        })
    }
}

const validateUserLogin = (req, res, next) => {

}

module.exports = {
    validateUserRegistration,
    validateUserLogin
}