// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
// import express from 'express';
import { app } from "./app.js"
import connectDB from "./db/index.js"
// const app = express();
dotenv.config({
    path: './.env'
})

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {

        console.log(`Server is Started at Port :${process.env.PORT}`)
    })
}).catch((err) => {
    console.log("MongoDB connenction faild !!!:", err)
})

