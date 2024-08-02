require('dotenv').config();
const express = require('express');

// DB
const connectDb = require('./db/db');
// Routers
const authRouter = require('./routes/auth-router');

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);

app.get('/', (req, res) => {
    res.send("Welcome To Blog Site");
})

const port = 2024;
const host = '127.0.0.1';


connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is started on http://${host}:${port}`);

    })
})