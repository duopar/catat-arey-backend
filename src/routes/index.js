const apiRouter = require('express').Router()

const userValidationRouter = require('./userValidationRoutes')
const userRouter = require('./userRoutes')
const productRouter = require('./productRoutes')

apiRouter.use(userValidationRouter)
apiRouter.use(userRouter)
apiRouter.use(productRouter)

module.exports = apiRouter