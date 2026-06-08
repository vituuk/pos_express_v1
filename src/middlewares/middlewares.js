const jwt=require("jsonwebtoken");

const authMiddleware=(req,res,next)=>{
    
    try{
      const authHeader=req.header("Authorization");
      console.log("authHeader",authHeader);
       if(!authHeader){
         return res.json({
            message:"Unauthorized"
        })
       }

       const token=authHeader.split(" ")[1];
       console.log("token",token);
       jwt.verify(token,"sala-express");
       next();

    }catch(error){
        console.log("error",error);
        return res.status(401).json({
            message: "Unauthorized",
            error: error.message
        });
    }
    
}

module.exports=authMiddleware;