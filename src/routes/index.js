const apiRouter = require('express').Router();

const userValidationRouter = require('./userValidationRoutes');
const userRouter = require('./userRoutes');
const productRouter = require('./productRoutes');
const inventoryLogRouter = require('./inventoryLogRoutes');

apiRouter.use('/auth', userValidationRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/inventory-logs', inventoryLogRouter);

module.exports = apiRouter;
