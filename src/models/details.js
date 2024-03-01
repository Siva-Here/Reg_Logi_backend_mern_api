const mongoose=require('mongoose')
const validator=require('validator')
require('dotenv').config()
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const registerSchema=new mongoose.Schema({
    username:{
        type:String,
        reequired:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Entered enail is undefined...')
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Entered password is undefined...')
            }
        }
    },
    confirmPassword:{
        type:String,
        required:true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Entered Confirm password is undefined...')
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})

registerSchema.methods.generateAuthToken=async function(){
    try{
        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY)
        this.tokens=this.tokens.concat({token:token})
        return token;
    }
    catch(err){
        res.send("the error part is "+err)
        console.log(err)
    }
}

registerSchema.pre("save",async function(next){
    try{
        if(this.isModified("password")){
            const hashedPwd=await bcrypt.hash(this.password,12)
            this.password=hashedPwd
            this.confirmPassword=await bcrypt.hash(this.password,12)
        }
    }
    catch(err){
        console.log(err)
    }
    next()
})

const Users=new mongoose.model("Users",registerSchema)
module.exports=Users