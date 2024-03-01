const express=require('express')
const app=express()
const bcrypt=require('bcrypt')
const auth=require('./middleware/auth')
const cookieParser=require('cookie-parser')
const Users=require('./models/details')
const PORT=process.env.PORT||8000
require('./db/conn')
require('dotenv').config();
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())

app.post("/register",async(req,res)=>{
    try{
        if(req.body.password===""||req.body.password===" "||req.body.confirmPassword===""||req.body.confirmPassword===" "){
            res.status(200).send('Passwords should not be null')
        }
        else if(req.body.password==req.body.confirmPassword){
            const user=new Users(req.body)
            const match=await Users.find({username:req.body.username})
            if(match.length>0){
                res.status(200).send("Username already exists")
                return;
            }
            else{
                const token=user.generateAuthToken()
                console.log(token)
                res.cookie("jwt",token,{
                    expires:new Date(Date.now()+30000),
                    httpOnly:true
                })
                const addedUser=await user.save()
                res.status(201).send(addedUser)
            }
        }
        else{
            res.status(200).send('Password and Confirm Passwords are Not Matched...')
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error...')
    }
})

app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const user = await Users.findOne({ username: username });
        if (!user) {
            res.status(200).send('No user found with the given email...');  
            return;
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            const token=await user.generateAuthToken();
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+30000),
                httpOnly:true,
                // secure:true   =>put it in production not require in localhost
            })
            await user.save()
            res.status(200).send("Successfully Logged In...."+token);
        } else {
            res.status(200).send("Password not matched...");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.get("/secret", auth,async (req, res) => {
    res.status(200).send(`This is the secret Page....`)
});

app.get("/logout",auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((currentToken)=>{return currentToken.token!==req.token})
        res.clearCookie("jwt")
        let user=await req.user.save()
        console.log(user)
        console.log(`Logged Out Sucessfulyy`);
        res.status(200).send(`Sucessfully Logged Out`)
    }
    catch(err){
        console.log(err)
        res.status(403).send(err)
    }
})
app.get("/logoutAll",auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        res.clearCookie("jwt")
        let user=await req.user.save()
        console.log(user)
        console.log(`Logged Out Sucessfulyy`);
        res.status(200).send(`Sucessfully Logged Out`)
    }
    catch(err){
        console.log(err)
        res.status(403).send(err)
    }
})
app.listen(PORT,()=>{
    console.log(`Server is running succesfully on ${PORT}`)
})