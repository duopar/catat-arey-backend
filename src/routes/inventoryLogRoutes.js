const inventoryLogRouter = require('express').Router();

const {
  validateCreateInventoryLog,
} = require('../middlewares/inventoryLogMiddleware');

const {
  getInventoryLogs,
  createInventoryLog,
  createInventoryLogFromHistory,
} = require('../controllers/inventoryLogController');

inventoryLogRouter.get('/', getInventoryLogs);
inventoryLogRouter.post('/', validateCreateInventoryLog, createInventoryLog);
inventoryLogRouter.post('/histories', createInventoryLogFromHistory);

module.exports = inventoryLogRouter;
