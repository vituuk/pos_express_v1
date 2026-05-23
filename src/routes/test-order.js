const express=require("express");
const router=express.Router();
const {Customer,Order,OrderDetail,Product}=require("../../models");

router.post("", async(req, res) => {
  try {
    const { customerId,items,location } = req.body;

    const customer = await Customer.findByPk(customerId);
    console.log("customer", customer);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }
    
    const orderDetail=[];
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
       orderDetail.push({
        productId,
        productName:product.name,
        productPrice:product.price,
        qty,
        amount
       })
     console.log("orderDetails",orderDetail)
    }

    const CreateOrder=await Order.create({
      customerId,
      orderNumber:1,
      total:total,
      discount:0,
      orderDate:new Date(),
      location
    })
    console.log("CreateOrder",CreateOrder);
    

    res.json({
      message: "Customer route working fine",
      // data: customer
    });

  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports=router;
