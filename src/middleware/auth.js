const jwt=require('jsonwebtoken')
const Users=require('../models/details')

const auth=async(req,res,next)=>{
    try{
        const jwtToken=req.cookies.jwt
        const verifyUser=jwt.verify(jwtToken,process.env.SECRET_KEY)
        const user=await Users.findOne({_id:verifyUser._id})
        if(user){
            req.token=jwtToken
            console.log(user.username)
            req.user=user
            req.token=jwtToken
            next()
        }
        else{
            res.send(401).send(`No Match Found in the dataBase...`)
        }
    }
    catch(err){
        console.log(err)
        res.status(401).send(err)
    }
}
module.exports=auth