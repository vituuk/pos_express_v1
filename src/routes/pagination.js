const express=require("express");
const router=express.Router();
const {Product,Category}=require("../../models");
const {Op}=require("sequelize");

router.get("",async(req,res)=>{
   try{
    const page=Number(req.query.page) || 1; 
    const limit=Number(req.query.limit) || 10; 
    console.log("page",page,"limit",limit); 
    const offset=(page-1)*limit; 

    let whereCondition={};
    if(req.query.search){
     whereCondition.name={
        [Op.iLike]:`%${req.query.search}%`
     }
    }

    if(req.query.categoryId){
      whereCondition.categoryId={
        [Op.eq]:req.query.categoryId
      }
    }

    const {rows:product,count:total}=await Product.findAndCountAll({
       where:whereCondition,
        limit,offset,
        include:[
            {
                model:Category,
             as:"category"
            }
        ]
    });
    const totalPages=Math.ceil(total/limit);
    res.json({
         message:"product route working fine",   
         data:product,
         pagination:{
           currentPage:page,
           limit,
           total,
           nextPage:page<totalPages ? page+1:null,
           prevPage:page>1 ? page-1:null
         }
    })
   }catch(error){
    console.log("error",error);
    res.status(500).json({
      message:"something went wrong"
    })
   }
})

module.exports=router;