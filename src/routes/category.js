const express=require("express");
const router=express.Router();
const {Category}=require("../../models");
const {Product}=require("../../models"); 
const { Op } = require("sequelize");

router.get("",async(req,res)=>{
try{
    let whereCondition = {};

    if (req.query.search) {
      whereCondition.name = {
        [Op.iLike]: `%${req.query.search}%`
      };
    }

    if (req.query.categoryId) {
      whereCondition.categoryId = req.query.categoryId;
    }

     const categories=await Category.findAll({
        where:whereCondition,
        include:[{model:Product,as:"products"}],
        order:[['id','ASC']]
     });
     res.json({
        message:"category route working fine",
        data:categories
     })
    }catch(error){
        console.log("error",error);
    }
})

router.get("/list",async(req,res)=>{
    try{
     const categories=await Category.findAll({
        order:[['id','ASC']]
     });
     
     res.json({
        message:"category route working fine",
        data:categories
     })
    }catch(error){
        console.log("error",error);
    }
})

router.post("",async(req,res)=>{
    try{
     const {name,is_active}=req.body;
     const category=await Category.create({
        name,is_active
     })
     res.json({
        message:"category created successfully",
        data:category
     })
    }catch(error){
        console.log("error",error);
    }
})

router.put("/:id",async(req,res)=>{
    try{
     const {id}=req.params;
     const {name,is_active}=req.body; 
     const category=await Category.findByPk(id);
     if(!category){
        res.json({
            message:"category not found"
        })
     }

     const upCategory=await category.update({
        name,is_active
     })
    res.json({
        message:"category updated successfully",
        data:upCategory
    })
    }catch(error){
        console.log("error",error);
    }
})  

router.delete("/:id",async(req,res)=>{
    try{
      const {id}=req.params;
      const category=await Category.findByPk(id);
      if(!category){
        res.json({
            message:"category not found"
        })
      }
      
      const deleteCategory=await category.destroy();
      res.json({
        message:"category deleted successfully",
        data:deleteCategory
      });
    
    }catch(error){
        console.log("error",error);
    }
})

module.exports=router;