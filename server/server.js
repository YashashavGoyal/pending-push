require('dotenv').config();
const express = require('express');
const cors = require('cors');

// DB
const connectDb = require('./db/db');
// Routers
const authRouter = require('./routes/auth-router');
const postRouter = require('./routes/post-route');
const adminRouter = require('./routes/admin-route');
const contactRouter = require('./routes/contact-route');
const errorMiddleware = require('./middleware/error-middleware');

const app = express();

app.use(express.json());

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true,
}

app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);


app.use(errorMiddleware);

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