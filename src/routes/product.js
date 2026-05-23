const express=require("express");
const router=express.Router();
const {Product}=require("../../models");
const {Category}=require("../../models");
const {ProductImage}=require("../../models");
const { Op } = require("sequelize");

router.get("",async(req,res)=>{
   try{

    // Pagination
    const page=Number(req.query.page) || 1;//if page is not set then set to 1
    const limit=Number(req.query.limit) || 10;//if limit is not set then set to 10
    console.log("page",page,"limit",limit);//input page and limit in postman
    const offset=(page-1)*limit;//offset for skip first record of limit (first limit1->5 then skip to 6->10)

     // 🔍 Search Condition
    let whereCondition = {};

    if (req.query.search) {
      whereCondition.name = {
        [Op.iLike]: `%${req.query.search}%`
      };
    }

    if (req.query.categoryId) {
      whereCondition.categoryId = req.query.categoryId;
    }

    const {rows:product,count:total}=await Product.findAndCountAll({
          where: whereCondition, ////apply search condition
        limit,offset,
        include:[{
            model:Category,
            as:"category",
            attributes: ["id", "name"],
        },
          {
          model: ProductImage,
          as: "productImages",
          attributes: ["id", "productId", "imageUrl", "fileName"],
        },
    ],

        order:[['id','ASC']]
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

router.post("",async(req,res)=>{
    try{
        const {name,description,color,price,qty,categoryId,is_active}=req.body;
        const product=await Product.create({
            name,
            description,
            color,
            price,
            qty,
            categoryId: categoryId || null,
            is_active: is_active !== undefined ? is_active : true
        })
        res.json({
            message:"product created successfully",
            data:product
        })
    }catch(error){
        console.log("error",error);
        res.status(500).json({
            message:"error creating product",
            error: error.message
        })
    }
})

router.put("/:id",async(req,res)=>{
    try{
     const {id}=req.params;
     const {name,description,color,price,qty,categoryId,is_active}=req.body;
     const product=await Product.findByPk(id);
     if(!product){
        res.json({
            message:"product not found"
        })
     }
     await product.update({
        name,description,color,price,qty,categoryId,is_active
     }) 

     const updatedProduct=await Product.findByPk(id,{
        include:[{model:Category,as:"category"}]
     })
     res.json({
        message:"product updated successfully",
        data:updatedProduct
     })     
    } catch(error){
        console.log("error",error);
    }
})

 router.delete("/:id",async(req,res)=>{
    try{
    const {id}=req.params;
    const product=await Product.findByPk(id);
    if(!product){
        res.json({
            message:"product not found"
        })
    }
    const deleteProduct=await product.destroy();
    res.json({
        message:"product deleted successfully",
        data:deleteProduct
    })
    } catch(error){
        console.log("error",error);
    }
 })

module.exports=router;  