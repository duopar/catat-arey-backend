const forecastRouter = require('express').Router();

const {
  getProducts,
  getInventoryLogs,
} = require('../middlewares/forecastMiddleware');

const { getSalesForecast } = require('../controllers/forecastController');

forecastRouter.get('/', getProducts, getInventoryLogs, getSalesForecast);

module.exports = forecastRouter;
