// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// --- Import Route Files ---
// The stripeRoutes file now returns an object with two routers
const { jsonRouter: stripeJsonRouter, webhookRouter: stripeWebhookRouter } =
  require("./routes/stripe")(stripe);
const adminMiddleware = require("./middleware/adminMiddleware");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();

// --- Middleware Setup ---

// 1. CORS: Handles cross-origin requests.
const allowedOrigins = [
  "https://kitvault.netlify.app", // Your live frontend URL
];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://127.0.0.1:5500"); // Allow local dev server
}
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

// 2. --- THIS IS THE FIX ---
// The Stripe WEBHOOK route comes BEFORE the general JSON parser.
// It uses its own raw body parser.
app.use("/api/stripe/webhook", stripeWebhookRouter);

// 3. General JSON Body Parser
// This will apply to all routes that are defined AFTER this line.
app.use(express.json());

// 4. All other API routes that expect JSON bodies
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminMiddleware, adminRoutes);
// This handles the /create-checkout-session route
app.use("/api/stripe", stripeJsonRouter);

// --- Serverless Export & Local Server ---
// (Your existing logic for module.exports and app.listen)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} else {
  module.exports = app;
}
