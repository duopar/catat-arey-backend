const inventoryLogRouter = require('express').Router();

const {
  validateCreateInventoryLog,
} = require('../middlewares/inventoryLogMiddleware');

const {
  getInventoryLog,
  createInventoryLog,
  createInventoryLogFromHistory,
} = require('../controllers/inventoryLogController');

inventoryLogRouter.get('/', getInventoryLog);
inventoryLogRouter.post('/', validateCreateInventoryLog, createInventoryLog);
inventoryLogRouter.post('/histories', createInventoryLogFromHistory);

module.exports = inventoryLogRouter;
