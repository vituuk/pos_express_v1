const express=require("express");
const router=express.Router();
const {v4:uuidv4}=require("uuid");
const path=require("path");
const {Product,ProductImage}=require("../../models");
const fs =require("fs");

const { storage, cloudinary } = require("../storage/storage");
const multer = require("multer");
const upload = multer({ storage });

router.post("/:id/upload",upload.single("file"),async(req,res)=>{
    try{
    //   const {file}=req.files;
       const file=req.file;
      const productId=req.params.id;
      const product=await Product.findByPk(productId);
      console.log("products",product);
      if(!product){
        res.json({
            message:`Product id=${productId} not found`
        })
      }

    const saveImage= await ProductImage.create({
        productId,
        imageUrl: file.path,
        fileName: file.originalname,
        publicId: file.filename,

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
            message:`Porduct image id=${imageId} not found`
        })
     }

    //  const fileName=image.imageUrl.split("/").pop();
     console.log("fileName",fileName);
    //  const filePath=path.join(process.cwd(),"uploads/products",fileName);
    //  if(!fs.existsSync(filePath)){
    //     res.json({
    //         message:`file id=${imageId} not found`
    //     })
    //  }
      if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId);
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

        // const fileName=image.imageUrl.split("/").pop();
        // const filePath=path.join(process.cwd(),"uploads/products",fileName);

        // if(fs.existsSync(filePath)){
        //     fs.unlinkSync(filePath);
        // }
        if(image.publicId){

            await cloudinary.uploader.destroy(image.publicId);
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