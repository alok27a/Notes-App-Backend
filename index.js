const connectToMongo = require('./DB');
const express = require('express')

connectToMongo();
const app = express()
const port = 3000


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
