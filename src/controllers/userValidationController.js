const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Timestamp } = require('@google-cloud/firestore');
const db = require('../config/firestore');
const {
  getAccessTokenSecret,
  getRefreshTokenSecret,
} = require('../middlewares/authMiddleware');

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = await db.collection('users').add({
      username,
      password: hashedPassword,
      role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful.',
      data: {
        userId: userRef.id,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Registration failed due to server error.',
      data: null,
    });
  }
};

const login = async (req, res) => {
  const { userId, username, role } = req.userData;

  const ACCESS_TOKEN_SECRET = getAccessTokenSecret();
  const REFRESH_TOKEN_SECRET = getRefreshTokenSecret();

  const accessToken = jwt.sign(
    { userId, username, role },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: '10m',
    }
  );

  const refreshToken = jwt.sign(
    { userId, username, role },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    data: {
      userId,
      username,
      accessToken,
      refreshToken,
    },
  });
};

const refresh = (req, res) => {
  const { userId, username, role } = req.decodedUserRefreshToken;

  const ACCESS_TOKEN_SECRET = getAccessTokenSecret();

  const accessToken = jwt.sign(
    { userId, username, role },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: '10m',
    }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Successfully retrieved access token.',
    data: {
      accessToken,
    },
  });
};

module.exports = {
  register,
  login,
  refresh,
};
