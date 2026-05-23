const express =require("express");
const router=express.Router();
const {User} =require("../../models");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

router.get("/register",async(req,res)=>{
    try{
        const users=await User.findAll();
        res.json({
            message:"User route working fine",
            data:users
        })
    }
    catch(error){
        console.log("error",error);
    }
})

router.post("/register",async(req,res)=>{
    try{
        const {firstName,lastName,email,password,gender,is_active}=req.body;
        const hashedPassword=await bcrypt.hash(password,10);
        const registerUser=await User.create({
            firstName,lastName,email,password:hashedPassword,gender,is_active
        })
        res.json({
            message:"User registered successfully",
            data:registerUser
        })
    } 
    catch(error){
        console.log("Registration error:",error);
    }

})

router.post("/login",async(req,res)=>{
    try{
      const {email,password}=req.body;

      if(!email || !password){
        return res.status(400).json({
            message:"Email and password are required",
        })
      }

      const user=await User.findOne({where:{email}});
      console.log("userss",user);

      if(!user){
        return res.status(404).json({
            message:"User email not found",
        })
      }

      const isMatch=await bcrypt.compare(password,user.password);
      console.log("isMatchs",isMatch);

      if(!isMatch){
        return res.status(401).json({
            message:"Invalid password",
        })
      }

      const token = jwt.sign({
        id:user.id,
        email:user.email,
        fullName:user.firstName + " " + user.lastName
      },"sala-express");

      console.log("Login successful, sending token");

      return res.status(200).json({
        message:"Login successful",
        data:token,
      })
    }catch(error){
        console.log("Login error:",error);
        return res.status(500).json({
            message:"Internal server error",
            error:error.message
        })
    }
})

module.exports=router;