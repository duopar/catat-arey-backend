require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const { validateUserApiKey } = require('./middlewares/authMiddleware')

const authRoutes = require('./routes/userValidationRoutes')
const userRoutes = require('./routes/userRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

app.use(express.json())
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(validateUserApiKey)

app.use('/api/v1', authRoutes)
app.use('/api/v1', userRouter)

module.exports = app
