// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js" 
import { app } from "./app.js"

dotenv.config({
    path:'./env'
})

connectDB().then(()=>{
 app.listen(process.env.PORT || 8000,()=>{

    console.log(`Server is Started at Port :${process.env.PORT}`)
 })
}).catch((err)=>{
    console.log("MongoDB connenction faild !!!:",err)

})









// // (async()=>{
// // try {
    
// //    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
// // } catch (error) {
// //     console.log("Error :",error);
// //     throw error;
// // }

// })()