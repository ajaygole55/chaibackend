import mongoose,{Schema, Types} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema =new Schema(
    {
        username:{
            Type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            Type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
           },
           fullName:{
            Type:String,
            required:true,
            trim:true,
           },
           avatar:{
            Type:String,//couldnary 
            require:true,

           },
           coverImage:{
            Type:String,//couldnary
            
           },
           watchHistory:[
            {
                Type:Schema.Types.ObjectId,
                ref:"Video"

            }
           ],
           password:{
            Type:String,
            require:[true,'Password is required'],
           },
           refreshToken:{
            Type:String,
           }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
     this.password=bcrypt.hash(this.password,10)
     next()
})
userSchema.methods.isPasswordCorrect =async function(password){
  return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccsesToken =async function(){
   return  jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken =async function(){
    return  jwt.sign({
        _id:this._id,
 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
    
}

export const User=mongoose.model("User",userSchema)