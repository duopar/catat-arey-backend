const bcrypt = require('bcrypt');
const db = require('../config/firestore');

const validateUserIdParam = async (req, res, next) => {
  const userId = req.params.userId;
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return res.status(404).json({
      status: 'error',
      message: 'No user found with the provided ID.',
      data: null,
    });
  }

  req.userData = {
    userId,
  };

  next();
};

const validateUserUpdate = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      status: 'error',
      message:
        'Missing required fields: currentPassword, newPassword, or confirmPassword.',
      data: null,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'newPassword and confirmPassword do not match.',
      data: null,
    });
  }

  const userId = req.params.userId;
  const decodedUserId = req.decodedUserToken.userId;

  if (userId !== decodedUserId) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot change password for another user.',
      data: null,
    });
  }

  try {
    const userData = (await db.collection('users').doc(userId).get()).data();
    const userPassword = userData.password;

    if (!(await bcrypt.compare(currentPassword, userPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials: currentPassword.',
        data: null,
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    req.userData.hashedNewPassword = hashedNewPassword;

    next();
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
  validateUserUpdate,
  validateUserIdParam,
};
