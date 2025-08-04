// middleware/adminMiddleware.js
const jwt = require("jsonwebtoken");
const pool = require("../db");

const adminMiddleware = async (req, res, next) => {
  // First, run the standard authentication check
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Malformed token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Now, check if the user is an admin
    const userResult = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
    }

    // If all checks pass, proceed
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = adminMiddleware;
