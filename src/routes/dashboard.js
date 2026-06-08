const express = require("express");
const router = express.Router();
const { Order, OrderDetail, Product, Category } = require("../../models");
const { Op, fn, col, literal } = require("sequelize");

/**
 * GET /api/v1/dashboard/stats
 * Returns KPI summary stats
 */
router.get("/stats", async (req, res) => {
  try {
    // Total revenue from all orders
    const revenueResult = await Order.findOne({
      attributes: [[fn("SUM", col("total")), "totalRevenue"]],
      raw: true,
    });
    const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

    // Total orders count
    const totalOrders = await Order.count();

    // Total products count
    const totalProducts = await Product.count();

    // Total categories count
    const totalCategories = await Category.count();

    // Revenue this month vs last month (for % change)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthRevenue = await Order.findOne({
      attributes: [[fn("SUM", col("total")), "rev"]],
      where: { createdAt: { [Op.gte]: startOfThisMonth } },
      raw: true,
    });

    const lastMonthRevenue = await Order.findOne({
      attributes: [[fn("SUM", col("total")), "rev"]],
      where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } },
      raw: true,
    });

    const thisMonth = parseFloat(thisMonthRevenue?.rev || 0);
    const lastMonth = parseFloat(lastMonthRevenue?.rev || 0);
    const revenueChange = lastMonth === 0
      ? (thisMonth > 0 ? 100 : 0)
      : (((thisMonth - lastMonth) / lastMonth) * 100);

    // Orders this month vs last month
    const thisMonthOrders = await Order.count({
      where: { createdAt: { [Op.gte]: startOfThisMonth } },
    });
    const lastMonthOrders = await Order.count({
      where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } },
    });
    const ordersChange = lastMonthOrders === 0
      ? (thisMonthOrders > 0 ? 100 : 0)
      : (((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100);

    res.json({
      message: "Dashboard stats",
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCategories,
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        ordersChange: parseFloat(ordersChange.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats", error: error.message });
  }
});

/**
 * GET /api/v1/dashboard/recent-orders
 * Returns latest 10 orders for the dashboard table
 */
router.get("/recent-orders", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const orders = await Order.findAll({
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          attributes: ["productName", "qty", "productPrice", "amount"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });

    res.json({
      message: "Recent orders",
      data: orders,
    });
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({ message: "Failed to load recent orders", error: error.message });
  }
});

module.exports = router;
