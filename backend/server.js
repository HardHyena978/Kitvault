// server.js
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const adminMiddleware = require("./middleware/adminMiddleware");
const adminRoutes = require("./routes/admin");

// --- Import Routes ---
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const orderRoutes = require("./routes/orders");
const stripeRoutes = require("./routes/stripe")(stripe); // Pass stripe instance
const path = require("path");

const PORT = process.env.PORT || 3001;
const app = express();

const allowedOrigins = [
  "https://kitvault.netlify.app", // <-- Your live Netlify URL
];

if (process.env.NODE_ENV !== "production") {
  // e.g., for VS Code Live Server
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
// --- Middleware ---
app.use(cors(corsOptions));
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/api/admin", adminMiddleware, adminRoutes);
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

// --- API Routes ---
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/stripe", stripeRoutes);

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ msg: "Please fill out all fields." });
  }

  try {
    await resend.emails.send({
      from: "KitVault Contact Form <onboarding@resend.dev>", // Keep this for testing
      to: "chakrab.nor@gmail.com", // <-- IMPORTANT: REPLACE WITH YOUR EMAIL
      subject: `New Message from ${name} via KitVault`,
      reply_to: email, // This lets you hit "Reply" in your email client to respond to the user
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>New Contact Form Submission</h2>
          <p>You have received a new message from your website's contact form.</p>
          <hr>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <p style="padding: 10px; border-left: 3px solid #eee;">${message}</p>
        </div>
      `,
    });

    res.status(200).json({ msg: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Resend API Error:", error);
    res
      .status(500)
      .json({ msg: "Sorry, there was an error sending your message." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
