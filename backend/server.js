// backend/server.js
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");

// --- Import Route Files ---
const adminMiddleware = require("./middleware/adminMiddleware");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const orderRoutes = require("./routes/orders");
const stripeRoutes = require("./routes/stripe")(stripe); // Pass stripe instance

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS Configuration ---
const allowedOrigins = ["https://kitvault.netlify.app"];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://127.0.0.1:5500");
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

// --- MIDDLEWARE & ROUTING SETUP (THE DEFINITIVE FIX) ---

// 1. SPECIAL ROUTE: Stripe Webhook
// This route is defined FIRST and uses a special RAW body parser.
// All requests to "/api/stripe/webhook" will be handled here and will NOT pass to the JSON parsers below.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeRoutes
);

// 2. GENERAL JSON PARSING AND BUFFER FIX
// This applies to ALL other routes defined below.
app.use(express.json());

app.use((req, res, next) => {
  if (req.body instanceof Buffer && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (e) {
      return res.status(400).json({ msg: "Invalid JSON in request body." });
    }
  }
  next();
});

// 3. ALL OTHER STANDARD API ROUTES
// These routes now correctly receive a parsed JSON body.
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminMiddleware, adminRoutes);
// This handles all routes in stripe.js EXCEPT the webhook, which was handled above.
app.use("/api/stripe", stripeRoutes);

// --- Contact Form Route (requires parsed JSON body) ---
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "Please fill out all fields." });
  }

  try {
    await resend.emails.send({
      from: "KitVault Contact Form <onboarding@resend.dev>",
      to: "chakrab.nor@gmail.com",
      subject: `New Message from ${name} via KitVault`,
      reply_to: email,
      html: `<!-- ... your email html ... -->`,
    });
    res.status(200).json({ msg: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Resend API Error:", error);
    res
      .status(500)
      .json({ msg: "Sorry, there was an error sending your message." });
  }
});

// --- Server Start & Serverless Export ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} else {
  module.exports = app;
}
