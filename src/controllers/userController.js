const db = require('../config/firestore')

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id
        const userData = (await db.collection('users').doc(userId).get()).data()
        const { username, createdAt, updatedAt } = userData

        return res.status(200).json({
            status: 'success',
            message: 'Successfully retrieved user data.',
            data: {
                userId,
                username, 
                createdAt, 
                updatedAt
            }
        })
    } catch (error) {
        console.error("Error querying data:", error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve user data due to server error: error querying data.',
            data: null
        })
    }
}

module.exports = {
    getUserById
}