// backend/routes/stripe.js

const express = require("express");
const pool = require("../db");

// This function will be called from server.js and given the stripe instance
module.exports = function (stripe) {
  // ROUTER 1: For routes that need a parsed JSON body
  const jsonRouter = express.Router();

  // ROUTER 2: For the webhook route that needs a raw body
  const webhookRouter = express.Router();

  // --- Logic for routes that need JSON (like creating a session) ---
  jsonRouter.post("/create-checkout-session", async (req, res) => {
    try {
      const { items } = req.body; // req.body is a parsed JavaScript object here

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid cart items provided." });
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5500";
      const successUrl = `${frontendUrl}/success.html`;
      const cancelUrl = `${frontendUrl}/cart.html`;

      const line_items = items.map((item) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              images: [`${frontendUrl}/${item.image_url}`],
            },
            unit_amount: item.price_in_cents,
          },
          quantity: item.quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: line_items,
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ id: session.id });
    } catch (err) {
      console.error("!!! Stripe Session Error:", err.message);
      res.status(500).json({
        error: "Failed to create payment session.",
        details: err.message,
      });
    }
  });

  // --- Logic for the webhook route that needs a RAW body ---
  // We attach the raw body parser directly to this specific route handler.
  webhookRouter.post(
    "/",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        // req.body is now a raw Buffer, which is what the library needs.
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error("❌ Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("✅ Payment was successful for session:", session.id);
        // Your logic to fulfill the order in your Supabase database goes here.
      }

      res.status(200).json({ received: true });
    }
  );

  // Export both routers so server.js can use them
  return { jsonRouter, webhookRouter };
};
