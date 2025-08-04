// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../db");

// @route   GET api/orders
// @desc    Get all orders for a user
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const ordersResult = await pool.query(
      "SELECT id, total_amount_in_cents, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    const orders = ordersResult.rows;

    for (let order of orders) {
      const itemsResult = await pool.query(
        "SELECT oi.quantity, oi.price_at_purchase_in_cents, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1",
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
