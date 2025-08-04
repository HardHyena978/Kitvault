// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // 2. Bcrypt the user's password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert the new user into the database
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash]
    );

    // 4. Generate a JWT token
    const token = jwt.sign(
      { user: { id: newUser.rows[0].id } },
      process.env.JWT_SECRET, // Create a JWT_SECRET in your .env file
      { expiresIn: "1hr" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 2. Compare the submitted password with the stored hash
    const isValidPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!isValidPassword) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 3. Generate and return a JWT token
    const token = jwt.sign(
      { user: { id: user.rows[0].id } },
      process.env.JWT_SECRET,
      { expiresIn: "1hr" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
