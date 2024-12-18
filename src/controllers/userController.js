const bcrypt = require('bcrypt');
const { Timestamp } = require('@google-cloud/firestore');
const db = require('../config/firestore');

const getUserById = async (req, res) => {
  const userId = req.params.userId;
  const { username, role, createdAt, updatedAt } = req.userData;

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
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { newPassword } = req.body;

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

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
