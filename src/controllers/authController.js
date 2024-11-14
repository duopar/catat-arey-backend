const bcrypt = require('bcrypt')
const db = require('../config/firestore')
const { Timestamp } = require('@google-cloud/firestore')

const register = async (req, res) => {
    try {
        const { username, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        const userRef = await db.collection('users').add({
            username,
            hashedPassword,
            createdAt: Timestamp.now()
        })

        res.status(200).json({
            status: 'success',
            message: 'Registration successful.',
            data: {
                userId: userRef.id,
                username
            }
        })
    } catch (error) {
        console.error("Error registering user:", error)
        res.status(500).json({
            status: 'error',
            message: 'Registration failed due to server error.',
            data: null
        })
    }
}

const login = (req, res) => {

}

const logout = (req, res) => {

}

module.exports = {
    register,
    login,
    logout
}