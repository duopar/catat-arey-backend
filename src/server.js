const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`Aplikasinya udah jalan coyy di port ${port}`)
    console.log('Tinggal akses aja di http://localhost:3000/')
})