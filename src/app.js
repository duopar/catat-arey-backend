require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/authRoutes')

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(helmet())

app.use('/api/v1', authRoutes)

module.exports = app

