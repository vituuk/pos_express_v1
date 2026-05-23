const express = require("express");
const router = express.Router();
const { Order, Customer, OrderDetail } = require("../../models");
const generateDoc = require("../utils/generateOrderDoc");

router.get("/:orderId/generate-dock", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include:[
            {
                model:Customer,
                as:"customer"
            },         
            {
                model:OrderDetail,
                as:"orderDetails"
            }
        ]
    }
  );
  console.log("order", order);
    if (!order) {
      res.json({
        message: "order not found",
      });
    }
 
  const buffer = generateDoc(order.toJSON());
     res.setHeader(
      "Content-Disposition",
      `attachment; filename=order-${order.orderNumber}.docx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.send(buffer);
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = router;
