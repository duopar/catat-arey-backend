const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const {
  validateUserApiKey,
  validateUserAccessOrRefreshToken,
} = require('./middlewares/authMiddleware');

const apiRouter = require('./routes');

const app = express();

app.use(express.json());
app.use(
  process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev')
);
app.use(helmet());
app.use(cors());

app.use(validateUserApiKey);
app.use((req, res, next) => {
  if (req.path.includes('/auth') && !req.path.includes('/refresh')) {
    return next();
  }
  validateUserAccessOrRefreshToken(req, res, next);
});

app.use('/api/v1', apiRouter);

module.exports = app;
