// backend/routes/products.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the database connection pool

// GET /api/products/ - Get all products
// backend/routes/products.js

/// backend/routes/products.js

// GET /api/products/ - Get all products (now with filtering AND searching)
router.get("/", async (req, res) => {
  try {
    const { team_type, search } = req.query;

    let baseQuery = "SELECT * FROM products";
    const params = [];
    const whereClauses = [];
    let paramCounter = 1;

    // Add filter for team_type if provided
    if (team_type) {
      whereClauses.push(`team_type = $${paramCounter}`);
      params.push(team_type);
      paramCounter++;
    }

    // Add filter for search term if provided
    if (search) {
      whereClauses.push(`name ILIKE $${paramCounter}`);
      params.push(`%${search}%`);
      paramCounter++;
    }

    // If there are any filters, add the WHERE clause to the query
    if (whereClauses.length > 0) {
      baseQuery += " WHERE " + whereClauses.join(" AND ");
    }

    baseQuery += " ORDER BY id ASC";

    const allProducts = await pool.query(baseQuery, params);
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// GET /api/products/:id - Get a single product by its ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Check if the ID from the URL is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ msg: "Invalid product ID format." });
  }

  try {
    const productQuery = "SELECT * FROM products WHERE id = $1";
    const product = await pool.query(productQuery, [id]);

    // Check if the database returned a product
    if (product.rows.length === 0) {
      return res.status(404).json({ msg: `Product with ID ${id} not found.` });
    }

    // If successful, send the product data
    res.json(product.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/products/category/:category - Get products by category
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const productQuery =
      "SELECT * FROM products WHERE category = $1 ORDER BY id ASC";
    const products = await pool.query(productQuery, [category]);
    res.json(products.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/products/search/:query - Search for products
router.get("/search/:query", async (req, res) => {
  const { query } = req.params;
  try {
    const productQuery =
      "SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY id DESC";
    const products = await pool.query(productQuery, [`%${query}%`]);
    res.json(products.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
