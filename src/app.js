require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware')
const authRoutes = require('./routes/authRoutes')

const app = express()

app.use(express.json())
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(apiKeyMiddleware)

app.use('/api/v1', authRoutes)

module.exports = app

