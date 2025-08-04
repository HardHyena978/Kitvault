// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ msg: "Malformed token, authorization denied" });
    }

    // --- DEBUG LOG: SHOWING THE SECRET BEING USED ---
    // This will confirm that your .env file is being loaded correctly.
    console.log(
      "Attempting to verify token with secret:",
      process.env.JWT_SECRET
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;

    console.log("✅ Token successfully verified for user:", req.user.id);

    next();
  } catch (err) {
    // *** THIS IS THE CRITICAL NEW LOG ***
    // This will tell us EXACTLY why the token is invalid.
    console.error("❌ JWT VERIFICATION FAILED. Details:", err);

    res.status(401).json({ msg: "Token is not valid" });
  }
};
