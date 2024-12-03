const apiRouter = require('express').Router();

const userValidationRouter = require('./userValidationRoutes');
const userRouter = require('./userRoutes');
const productRouter = require('./productRoutes');

apiRouter.use('/auth', userValidationRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/products', productRouter);

module.exports = apiRouter;
