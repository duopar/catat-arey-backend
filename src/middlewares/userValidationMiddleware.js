const bcrypt = require('bcrypt')
const db = require('../config/firestore')

const validateUserRegistration = async (req, res, next) => {
    try {
        const { username, password, confirmPassword, role } = req.body

        if (!username || !password || !confirmPassword || !role) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: username, password, confirmPassword, or role.',
                data: null
            })
        }
    
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'password and confirmPassword do not match.',
                data: null
            })
        }

        if (role !== 'owner' && role !== 'employee') {
            return res.status(400).json({
                status: 'error',
                message: 'role must be "owner" or "employee".',
                data: null
            })
        }
    
        const userSnapshot = await db.collection('users').where('username', '==', username).get()

        if (!userSnapshot.empty) {
            return res.status(400).json({
                status: 'error',
                message: 'Username already exists.',
                data: null
            })
        }

        req.userData = {
            username,
            password,
            role
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

const validateUserLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: username, or password.',
                data: null
            })
        }
    
        const userSnapshot = await db.collection('users').where('username', '==', username).get()
        
        if (userSnapshot.empty) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials: username, or password.',
                data: null
            })
        }
        
        const userPassword = userSnapshot.docs[0].data().password

        if (!(await bcrypt.compare(password, userPassword))) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials: username, or password.',
                data: null
            })
        }

        const userId = userSnapshot.docs[0].id
        const userRole = userSnapshot.docs[0].data().role

        req.userData = {
            userId,
            username,
            userRole
        }
    
        next()
    } catch (error) {
        console.error("Error querying data:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Login failed due to server error: error querying data.',
            data: null
        })
    }
}

module.exports = {
    validateUserRegistration,
    validateUserLogin
}