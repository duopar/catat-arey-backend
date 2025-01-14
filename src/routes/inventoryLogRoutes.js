const inventoryLogRouter = require('express').Router();

const {
  validateCreateInventoryLog,
} = require('../middlewares/inventoryLogMiddleware');

const {
  createInventoryLog,
  createInventoryLogFromHistory,
} = require('../controllers/inventoryLogController');

inventoryLogRouter.post('/', validateCreateInventoryLog, createInventoryLog);
inventoryLogRouter.post('/histories', createInventoryLogFromHistory);

module.exports = inventoryLogRouter;
