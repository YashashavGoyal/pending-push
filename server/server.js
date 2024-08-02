const express = require('express');

const app = express();


app.get('/',(req,res)=> {
    res.send("Welcome To Blog Site");
})

const port = 2024;
const host = '127.0.0.1';

app.listen(port, host, ()=> {
    console.log(`Server is started on http://${host}:${port}`);
    
})