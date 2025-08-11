// backend/routes/stripe.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const { Resend } = require("resend");

// This function receives the initialized stripe object from server.js
module.exports = (stripe) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // --- CREATE CHECKOUT SESSION ROUTE ---
  // This route expects a parsed JSON body from server.js.
  router.post("/create-checkout-session", authMiddleware, async (req, res) => {
    const { cartItems } = req.body;
    let orderId;

    try {
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price_in_cents * item.quantity,
        0
      );
      const newOrder = await pool.query(
        "INSERT INTO orders (user_id, total_amount_in_cents, status) VALUES ($1, $2, $3) RETURNING id",
        [req.user.id, totalAmount, "pending"]
      );
      orderId = newOrder.rows[0].id;

      const lineItems = cartItems.map((item) => {
        const imageUrl = `https://kitvault.netlify.app${item.image_url}`;
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.name} (${item.size || "Standard"})`,
              images: [imageUrl],
              metadata: { db_product_id: item.id },
            },
            unit_amount: item.price_in_cents,
          },
          quantity: item.quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        metadata: { db_order_id: orderId, db_user_id: req.user.id },
        success_url: `https://kitvault.netlify.app/success.html`,
        cancel_url: `https://kitvault.netlify.app/cancel.html`,
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"],
        },
      });

      res.json({ url: session.url });
    } catch (e) {
      console.error("Stripe session creation failed:", e.message);
      if (orderId) {
        await pool.query("DELETE FROM orders WHERE id = $1", [orderId]);
      }
      res
        .status(500)
        .json({
          error: "Failed to create payment session.",
          details: e.message,
        });
    }
  });

  // --- STRIPE WEBHOOK ROUTE ---
  // This route receives a RAW body from server.js.
  router.post("/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // This is a raw Buffer because of the middleware in server.js
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const sessionFromEvent = event.data.object;
      const client = await pool.connect();
      try {
        const session = await stripe.checkout.sessions.retrieve(
          sessionFromEvent.id,
          { expand: ["line_items", "line_items.data.price.product"] }
        );

        const orderId = session.metadata.db_order_id;
        const customerEmail = session.customer_details.email;
        const lineItems = session.line_items.data;

        await client.query("BEGIN");

        await client.query(
          "UPDATE orders SET status = $1, shipping_address = $2 WHERE id = $3",
          ["completed", JSON.stringify(session.shipping_details), orderId]
        );

        for (const item of lineItems) {
          const product = item.price.product;
          const productId = product.metadata.db_product_id;
          if (!productId) continue;
          await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase_in_cents) VALUES ($1, $2, $3, $4)`,
            [orderId, productId, item.quantity, item.price.unit_amount]
          );
        }

        await client.query("COMMIT");
        console.log(`Successfully processed and saved order ${orderId}.`);

        // --- Send Confirmation Email ---
        // ... (Your email sending logic here)
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Webhook database transaction failed:", err);
        return res.status(500).send("Server error while saving order.");
      } finally {
        client.release();
      }
    }

    res.status(200).json({ received: true });
  });

  return router;
};
