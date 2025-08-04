// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../db");

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // The user ID is attached to req.user by the middleware
    const user = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
