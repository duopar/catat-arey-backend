const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Timestamp } = require('@google-cloud/firestore')
const db = require('../config/firestore')

const register = async (req, res) => {
    try {
        const { username, password } = req.userData

        const hashedPassword = await bcrypt.hash(password, 10)

        const userRef = await db.collection('users').add({
            username,
            password: hashedPassword,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        })

        return res.status(200).json({
            status: 'success',
            message: 'Registration successful.',
            data: {
                userId: userRef.id
            }
        })
    } catch (error) {
        console.error("Error registering user:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Registration failed due to server error.',
            data: null
        })
    }
}

const login = (req, res) => {
    const { userId, username } = req.userData

    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '1h' })

    return res.status(200).json({
        status: 'success',
        message: 'Login successful.',
        data: {
            userId,
            username,
            token
        }
    })
}

module.exports = {
    register,
    login
}