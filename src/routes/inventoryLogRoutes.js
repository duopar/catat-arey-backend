const inventoryLogRouter = require('express').Router();

const {
  validateCreateInventoryLog,
} = require('../middlewares/inventoryLogMiddleware');

const { createInventoryLog } = require('../controllers/inventoryLogController');

inventoryLogRouter.post('/', validateCreateInventoryLog, createInventoryLog);

module.exports = inventoryLogRouter;
