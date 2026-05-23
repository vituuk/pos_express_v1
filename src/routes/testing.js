const express=require("express");
const router=express.Router();

router.get("",(req,res)=>{
    res.json({
        message:"testing route working fine"
    })
})

module.exports=router;