const http = require('http')
const app = require('./app')

const PORT = 8080

const sever = http.createServer(app)

sever.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
