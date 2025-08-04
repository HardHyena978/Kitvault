// routes/admin.js
// This file contains all API endpoints protected by the adminMiddleware.

const express = require("express");
const router = express.Router();
const pool = require("../db"); // Your database connection pool
const bcrypt = require("bcryptjs"); // For hashing passwords

// ------------------------------------------------------------------
// --- DASHBOARD ROUTES ---
// ------------------------------------------------------------------

// GET all dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [revenueResult, ordersResult, productsResult, pendingOrdersResult] =
      await Promise.all([
        pool.query(
          "SELECT SUM(total_amount_in_cents) FROM orders WHERE status = 'completed'"
        ),
        pool.query("SELECT COUNT(*) FROM orders"),
        pool.query("SELECT COUNT(*) FROM products"),
        pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'"),
      ]);

    const totalRevenue = revenueResult.rows[0].sum || 0;
    const totalOrders = ordersResult.rows[0].count || 0;
    const totalProducts = productsResult.rows[0].count || 0;
    const pendingOrders = pendingOrdersResult.rows[0].count || 0;

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      pendingOrders,
    });
  } catch (err) {
    console.error("!!! DATABASE ERROR fetching dashboard stats:", err.stack);
    res.status(500).send("Server Error");
  }
});

// GET data specifically formatted for charts
router.get("/chart-data", async (req, res) => {
  try {
    const monthlyRevenueQuery = `
      SELECT 
        to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
        SUM(total_amount_in_cents) AS revenue
      FROM orders
      WHERE status = 'completed' AND created_at > NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY month;
    `;
    const orderStatusQuery = `
      SELECT status, COUNT(*)
      FROM orders
      GROUP BY status;
    `;

    const [revenueResult, statusResult] = await Promise.all([
      pool.query(monthlyRevenueQuery),
      pool.query(orderStatusQuery),
    ]);

    res.json({
      monthlyRevenue: revenueResult.rows,
      orderStatusCounts: statusResult.rows,
    });
  } catch (err) {
    console.error("!!! DATABASE ERROR fetching chart data:", err.stack);
    res.status(500).send("Server Error");
  }
});

// ------------------------------------------------------------------
// --- ORDER ROUTES ---
// ------------------------------------------------------------------

// GET all orders
router.get("/orders", async (req, res) => {
  try {
    const allOrders = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(allOrders.rows);
  } catch (err) {
    console.error("!!! DATABASE ERROR fetching all orders:", err.stack);
    res.status(500).send("Server Error");
  }
});

// GET details for a specific order by ID
router.get("/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        oi.quantity,
        oi.price_at_purchase_in_cents,
        p.name AS "productName",
        p.image_url AS "imageUrl"
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error(
      `!!! DATABASE ERROR fetching details for order #${id}:`,
      err.stack
    );
    res.status(500).send("Server Error");
  }
});

// ------------------------------------------------------------------
// --- PRODUCT ROUTES ---
// ------------------------------------------------------------------

// GET all products
router.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query(
      "SELECT * FROM products ORDER BY id ASC"
    );
    res.json(allProducts.rows);
  } catch (err) {
    console.error("!!! DATABASE ERROR fetching all products:", err.stack);
    res.status(500).send("Server Error");
  }
});

// POST a new product
router.post("/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price_in_cents,
      image_url,
      category,
      team_type,
    } = req.body;
    const newProduct = await pool.query(
      "INSERT INTO products (name, description, price_in_cents, image_url, category, team_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, price_in_cents, image_url, category, team_type]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error("!!! DATABASE ERROR creating product:", err.stack);
    res.status(500).send("Server Error");
  }
});

// PUT (update) a product
router.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price_in_cents,
      image_url,
      category,
      team_type,
    } = req.body;
    const updatedProduct = await pool.query(
      "UPDATE products SET name = $1, description = $2, price_in_cents = $3, image_url = $4, category = $5, team_type = $6 WHERE id = $7 RETURNING *",
      [name, description, price_in_cents, image_url, category, team_type, id]
    );
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error(`!!! DATABASE ERROR updating product #${id}:`, err.stack);
    res.status(500).send("Server Error");
  }
});

// DELETE a product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    console.error(`!!! DATABASE ERROR deleting product #${id}:`, err.stack);
    res.status(500).send("Server Error");
  }
});

// ------------------------------------------------------------------
// --- USER ROUTES ---
// ------------------------------------------------------------------

// GET all users (excluding passwords)
router.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query(
      "SELECT id, name, email, created_at, is_admin FROM users ORDER BY id ASC"
    );
    res.json(allUsers.rows);
  } catch (err) {
    console.error("!!! DATABASE ERROR fetching users:", err.stack);
    res.status(500).send("Server Error");
  }
});

// POST - Create a new user
router.post("/users", async (req, res) => {
  const { name, email, password, is_admin } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Please provide a name, email, and password." });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, created_at, is_admin",
      [name, email, hashedPassword, is_admin || false]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("!!! DATABASE ERROR creating user:", err.stack);
    res.status(500).send("Server Error");
  }
});

// PUT - Update a user's details
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, is_admin, password } = req.body;
  try {
    let updatedUser;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedUser = await pool.query(
        "UPDATE users SET name = $1, email = $2, is_admin = $3, password_hash = $4 WHERE id = $5 RETURNING id, name, email, created_at, is_admin",
        [name, email, is_admin, hashedPassword, id]
      );
    } else {
      updatedUser = await pool.query(
        "UPDATE users SET name = $1, email = $2, is_admin = $3 WHERE id = $4 RETURNING id, name, email, created_at, is_admin",
        [name, email, is_admin, id]
      );
    }
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ msg: "User not found." });
    }
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(`!!! DATABASE ERROR updating user #${id}:`, err.stack);
    res.status(500).send("Server Error");
  }
});

// DELETE a user
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: "User not found." });
    }
    res.json({ msg: `User with ID ${id} deleted successfully.` });
  } catch (err) {
    console.error(`!!! DATABASE ERROR deleting user #${id}:`, err.stack);
    if (err.code === "23503") {
      return res
        .status(400)
        .json({ msg: "Cannot delete user. They have existing orders." });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
