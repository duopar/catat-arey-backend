const forecastRouter = require('express').Router();

const { getInventoryLogs } = require('../middlewares/forecastMiddleware');

const { getSalesForecast } = require('../controllers/forecastController');

forecastRouter.get('/', getInventoryLogs, getSalesForecast);

module.exports = forecastRouter;
