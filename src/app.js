require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const { validateUserApiKey, validateUserToken } = require('./middlewares/authMiddleware')

const userValidationRouter = require('./routes/userValidationRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

app.use(express.json())
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(validateUserApiKey)
app.use((req, res, next) => {
    if (req.path.includes('/auth')) {
        return next()
    }
    validateUserToken(req, res, next)
})

app.use('/api/v1', userValidationRouter)
app.use('/api/v1', userRouter)

module.exports = app
