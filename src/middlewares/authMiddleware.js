const jwt = require('jsonwebtoken');
const getSecret = require('../config/secretManager');

let API_KEY = null;
let ACCESS_TOKEN_SECRET = null;
let REFRESH_TOKEN_SECRET = null;

const initializeSecrets = async () => {
  API_KEY = await getSecret('API_KEY');
  ACCESS_TOKEN_SECRET = await getSecret('ACCESS_TOKEN_SECRET');
  REFRESH_TOKEN_SECRET = await getSecret('REFRESH_TOKEN_SECRET');
};

const getApiKey = () => {
  return API_KEY;
};

const getAccessTokenSecret = () => {
  return ACCESS_TOKEN_SECRET;
};

const getRefreshTokenSecret = () => {
  return REFRESH_TOKEN_SECRET;
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

const validateUserAccessOrRefreshToken = (req, res, next) => {
  const tokenTypes = !req.path.includes('/refresh')
    ? ['Access', 'access']
    : ['Refresh', 'refresh'];

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: `${tokenTypes[0]} token is missing in the "authorization" header.`,
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
      message: `Invalid ${tokenTypes[1]} token format. Expected "Bearer <your-${tokenTypes[1]}-token>".`,
      data: null,
    });
  }

  try {
    const userToken = authHeaderParts[1];

    if (tokenTypes[1] === 'access') {
      const decodedUserAccessToken = jwt.verify(userToken, ACCESS_TOKEN_SECRET);

      req.decodedUserAccessToken = decodedUserAccessToken;
    } else {
      const decodedUserRefreshToken = jwt.verify(
        userToken,
        REFRESH_TOKEN_SECRET
      );

      req.decodedUserRefreshToken = decodedUserRefreshToken;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: `${tokenTypes[0]} token has expired.`,
        data: null,
      });
    }

    return res.status(401).json({
      status: 'error',
      message: `${tokenTypes[0]} token is invalid.`,
      data: null,
    });
  }
};

module.exports = {
  initializeSecrets,
  validateUserApiKey,
  validateUserAccessOrRefreshToken,
  getApiKey,
  getAccessTokenSecret,
  getRefreshTokenSecret,
};
