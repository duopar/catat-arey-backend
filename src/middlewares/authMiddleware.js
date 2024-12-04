const jwt = require('jsonwebtoken');
const getSecret = require('../config/secretManager');

let API_KEY = null;
let JWT_SECRET = null;

const initializeSecrets = async () => {
  API_KEY = await getSecret('API_KEY');
  JWT_SECRET = await getSecret('JWT_SECRET');
};

const validateUserApiKey = async (req, res, next) => {
  const userApiKey = req.headers['x-api-key'];

  if (!userApiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'API key is missing in the "x-api-key" header.',
      data: null,
    });
  }

  if (userApiKey !== API_KEY) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid API key.',
      data: null,
    });
  }

  next();
};

const validateUserToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Token is missing in the "authorization" header.',
      data: null,
    });
  }

  const authHeaderParts = authHeader.split(' ');

  if (
    authHeaderParts.length !== 2 ||
    authHeaderParts[0] !== 'Bearer' ||
    !authHeaderParts[1]
  ) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token format. Expected "Bearer <your-token>".',
      data: null,
    });
  }

  try {
    const userToken = authHeaderParts[1];
    const decodedUserToken = jwt.verify(userToken, JWT_SECRET);

    req.decodedUserToken = decodedUserToken;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired.',
        data: null,
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid token.',
      data: null,
    });
  }
};

module.exports = {
  initializeSecrets,
  validateUserApiKey,
  validateUserToken,
};
