const express=require("express");
const router=express.Router();
const {Customer,Order,OrderDetail,Product} =require("../../models");
// const order = require("../../../back-end/models/order");
router.get("",async(req,res)=>{
    try{
     const orders=await Order.findAll();
     res.json({
        message:"order route working fine",
        data:orders
     })
    }catch(error){
        console.log("error",error);
    }   
})
 
router.post("",async(req,res)=>{
    try{
    //    const {customerId,orderDate,location,items,discount,orderNumber}=req.body;
       const { items, discount } = req.body;
       //for customer will check if id have in customer and show  not create new data of customer
       // const customer=await Customer.findByPk(customerId);

       // console.log("Customer",customer);
       // //if don't have customer by check from id
       // if(!customer){
       //  res.json({
       //      message:"Customer not found"
       //  })
       // }
       //if it has data in customer from check by id and ពន្លាត by create orderDetaildata to loop to object create to array insetbuk to db 
    //    "items":[
    //     {
    //         "productId":1,
    //         "qty":4
    //     },
    //      {
    //         "productId":3,
    //         "qty":4
    //     }

    // ]
       const orderDetailsData=[];
       let total=0;
       for(const item of items){
       const {productId,qty}=item;
       const product=await Product.findByPk(productId);

       console.log("Products",product);
       if(!product){
        res.json({
            message:" Product not found",
        })
       }

       const amount=product.price * qty;
       total+=amount;
       orderDetailsData.push({
            productId,
            productName:product.name,
            productPrice:product.price,
            qty,
            amount
        })
    
    }
    console.log("OrderDetails",orderDetailsData);
 
const orderNumber = generateInvoiceNumber();
const createOrder=await Order.create({
   
    customerId:0,
    orderNumber:orderNumber,
    total:total,
    discount:discount,
    orderDate:new Date(),
    location:"N/A"
})
console.log("CreateOrder",createOrder);

 const orderDetails= orderDetailsData.map((item)=>({
            productId:item.productId,
            productName:item.productName,
            productPrice:item.productPrice,
            qty:item.qty,
            amount:item.amount,
            orderId:createOrder.id
}));
      await OrderDetail.bulkCreate(orderDetails);

    const completedOrder=await Order.findByPk(createOrder.id,{
        include:[        
            {
                model:OrderDetail,
                as:"orderDetails"
            }
        ]
      })

       res.json({
        message:"Order successfully",    
        data:completedOrder
    })
    
    }
catch(error){
console.log("error",error);
}
});

function generateInvoiceNumber() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `SalaIT-${year}${month}${day}-${hours}${minutes}`;
}

module.exports=router;