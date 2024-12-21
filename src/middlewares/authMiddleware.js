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

const validateUserAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is missing in the "authorization" header.',
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
        message:
          'Invalid access token format. Expected "Bearer <your-access-token>".',
        data: null,
      });
    }

    const userAccessToken = authHeaderParts[1];
    const decodedUserAccessToken = jwt.verify(
      userAccessToken,
      ACCESS_TOKEN_SECRET
    );

    req.decodedUserAccessToken = decodedUserAccessToken;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access token has expired.',
        data: null,
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Access token is invalid.',
      data: null,
    });
  }
};

const validateUserRefreshToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is missing in the "authorization" header.',
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
        message:
          'Invalid refresh token format. Expected "Bearer <your-refresh-token>".',
        data: null,
      });
    }

    const userRefreshToken = authHeaderParts[1];
    const decodedUserRefreshToken = jwt.verify(
      userRefreshToken,
      REFRESH_TOKEN_SECRET
    );

    req.decodedUserRefreshToken = decodedUserRefreshToken;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token has expired.',
        data: null,
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Refresh token is invalid.',
      data: null,
    });
  }
};

module.exports = {
  initializeSecrets,
  validateUserApiKey,
  validateUserAccessToken,
  validateUserRefreshToken,
  getApiKey,
  getAccessTokenSecret,
  getRefreshTokenSecret,
};
