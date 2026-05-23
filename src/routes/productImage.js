const express=require("express");
const router=express.Router();
const {v4:uuidv4}=require("uuid");
const path=require("path");
const {Product,ProductImage}=require("../../models");
const fs =require("fs");

router.post("/:id/upload",async(req,res)=>{
    try{
      const {file}=req.files;
      const productId=req.params.id;
      const product=await Product.findByPk(productId);
      console.log("products",product);
      if(!product){
        res.json({
            message:`Product id=${productId} not found`
        })
      }
       console.log("my file",file);
        const fileName=`${uuidv4()}${path.extname(file.name)}`;
        //upload file to upload/product//path.join(process.cwd() path directory
        const uploadPath=path.join(process.cwd(),"uploads/products",fileName);
        //,fileName or use file.name but when call from fileName that help protect duplicate filename
      await file.mv(uploadPath);
    //create new Domain + fileName //domain.com/uploads/products/1133.png
    const domain=`${req.protocol}://${req.get("host")}`;
    const imageUrl=`${domain}/uploads/products/${fileName}`;
    const saveImage= await ProductImage.create({
         imageUrl,
        productId,
        fileName:file.name//name get from input file
    })

      res.json({
        message:"Upload image successfully",
        data:saveImage
    }) 

    }catch(error){
        console.log("error",error);
    }
    
})

//download image
router.get("/images/:imageId/download",async(req,res)=>{
    try{
     const {imageId}=req.params;
     const image=await ProductImage.findByPk(imageId);
     if(!image){
        res.json({
            message:`Image id=${imageId} not found`
        })
     }

     const fileName=image.imageUrl.split("/").pop();
     console.log("fileName",fileName);
     const filePath=path.join(process.cwd(),"uploads/products",fileName);
     if(!fs.existsSync(filePath)){
        res.json({
            message:`file id=${imageId} not found`
        })
     }
     res.download(filePath,image.fileName);

    }catch(error){
        console.log("error",error);
    }
})

router.delete("/:imageId",async(req,res)=>{
    try{
        const {imageId}=req.params;
        const image=await ProductImage.findByPk(imageId);
        if(!image){
            return res.status(404).json({
                message:`Image id=${imageId} not found`
            })
        }

        const fileName=image.imageUrl.split("/").pop();
        const filePath=path.join(process.cwd(),"uploads/products",fileName);

        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }

        await image.destroy();

        res.json({
            message:"Image deleted successfully"
        })
    } catch(error){
        console.log("error",error);
        res.status(500).json({
            message:"Failed to delete image"
        })
    }
})

module.exports=router;