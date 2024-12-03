const { Timestamp } = require('@google-cloud/firestore');
const db = require('../config/firestore');

const getUserById = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const userData = (await db.collection('users').doc(userId).get()).data();
    const { username, role, createdAt, updatedAt } = userData;

    return res.status(200).json({
      status: 'success',
      message: 'User data retrieved successfully.',
      data: {
        userId,
        username,
        role,
        createdAt,
        updatedAt,
      },
    });
  } catch (error) {
    console.error('Error querying data:', error);
    return res.status(500).json({
      status: 'error',
      message:
        'Failed to retrieve user data due to server error: error querying data.',
      data: null,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, hashedNewPassword } = req.userData;

    await db.collection('users').doc(userId).update({
      password: hashedNewPassword,
      updatedAt: Timestamp.now(),
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password updated successfully.',
      data: null,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update password due to server error.',
      data: null,
    });
  }
};

module.exports = {
  getUserById,
  updateUser,
};
