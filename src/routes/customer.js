const express = require("express");
const router = express.Router();
const { Customer } = require("../../models");

router.get("", async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [["id", "ASC"]],
    });
    res.json({
      message: "customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("error fetching customers", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
