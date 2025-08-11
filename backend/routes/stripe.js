// routes/stripe.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const { Resend } = require("resend");

// This function receives the initialized stripe object from server.js
module.exports = (stripe) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // --- CREATE CHECKOUT SESSION ROUTE ---
  // This route creates the Stripe session and redirects the user to the payment page.
  router.post("/create-checkout-session", authMiddleware, async (req, res) => {
    const { cartItems } = req.body;
    let orderId;

    try {
      // 1. Create a 'pending' order in your database first.
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price_in_cents * item.quantity,
        0
      );
      const newOrder = await pool.query(
        "INSERT INTO orders (user_id, total_amount_in_cents, status) VALUES ($1, $2, $3) RETURNING id",
        [req.user.id, totalAmount, "pending"]
      );
      orderId = newOrder.rows[0].id;

      // 2. Format the cart items for Stripe's API.
      const lineItems = cartItems.map((item) => {
        const imageUrl = item.image_url.startsWith("http")
          ? item.image_url
          : `${item.image_url.startsWith("/") ? "" : "/"}${item.image_url}`;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.name} (${item.size || "Standard"})`,
              images: [imageUrl],
              metadata: {
                db_product_id: item.id,
              },
            },
            unit_amount: item.price_in_cents,
          },
          quantity: item.quantity,
        };
      });

      // 3. Create the Stripe Checkout Session.
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        metadata: { db_order_id: orderId, db_user_id: req.user.id },
        success_url: `${process.env.FRONTEND_URL}/success.html`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"],
        },
      });

      // 4. Send the session URL back to the frontend.
      res.json({ url: session.url });
    } catch (e) {
      console.error("Stripe session creation failed:", e.message);
      if (orderId) {
        await pool.query("DELETE FROM orders WHERE id = $1", [orderId]);
      }
      res.status(500).json({
        error: "Failed to create payment session.",
        details: e.message,
      });
    }
  });

  // --- STRIPE WEBHOOK ROUTE (FULLY CORRECTED) ---
  // This handles events sent from Stripe *after* a payment is completed.
  router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle only the checkout session completed event
      if (event.type === "checkout.session.completed") {
        const sessionFromEvent = event.data.object;
        const client = await pool.connect();

        try {
          // *** THE DEFINITIVE FIX IS HERE ***
          // Re-fetch the session from the Stripe API to expand all details,
          // including the line_items and their associated product objects.
          const session = await stripe.checkout.sessions.retrieve(
            sessionFromEvent.id,
            { expand: ["line_items", "line_items.data.price.product"] }
          );

          const orderId = session.metadata.db_order_id;
          const customerEmail = session.customer_details.email;
          const lineItems = session.line_items.data;

          await client.query("BEGIN");

          // 1. Update the order with the status and full shipping address
          await client.query(
            "UPDATE orders SET status = $1, shipping_address = $2 WHERE id = $3",
            ["completed", JSON.stringify(session.shipping_details), orderId]
          );

          // 2. Save each item from the order to the database
          for (const item of lineItems) {
            // The product object is now expanded and available
            const product = item.price.product;
            const productId = product.metadata.db_product_id;

            if (!productId) {
              console.warn(
                `Webhook Warning: db_product_id not found in metadata for Stripe product: ${product.id}`
              );
              continue;
            }

            await client.query(
              `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase_in_cents) VALUES ($1, $2, $3, $4)`,
              [orderId, productId, item.quantity, item.price.unit_amount]
            );
          }

          await client.query("COMMIT");
          console.log(`Successfully processed and saved order ${orderId}.`);

          // --- 3. SEND CONFIRMATION EMAIL (Now with correct data) ---
          try {
            const customerName =
              session.customer_details.name || "Valued Customer";

            let shippingHtml =
              "<p>Shipping information is being processed.</p>";
            if (session.shipping_details && session.shipping_details.address) {
              shippingHtml = `
                    <p style="margin: 0; padding: 0; line-height: 1.5;">
                      ${session.shipping_details.name || ""}<br>
                      ${session.shipping_details.address.line1 || ""}<br>
                      ${session.shipping_details.address.line2 || ""}<br>
                      ${session.shipping_details.address.city || ""}, ${session.shipping_details.address.state || ""} ${session.shipping_details.address.postal_code || ""}<br>
                      ${session.shipping_details.address.country || ""}
                    </p>
                `;
            }

            const itemsHtml = lineItems
              .map(
                (item) => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description} (x${item.quantity})</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.amount_total / 100).toFixed(2)}</td>
                </tr>`
              )
              .join("");

            await resend.emails.send({
              from: "KitVault <onboarding@resend.dev>",
              to: [customerEmail],
              subject: `Your KitVault Order Confirmation (#${orderId})`,
              html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #0F172A;">Thank you for your order!</h1>
                <p>Hi ${customerName},</p>
                <p>We've received your order #${orderId} and are getting it ready for shipment. You can view your full order history on our website.</p>
                <h2 style="color: #0F172A; border-top: 1px solid #eee; padding-top: 20px;">Order Summary</h2>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                  <thead>
                    <tr>
                      <th style="padding: 8px; border-bottom: 2px solid #333;">Item</th>
                      <th style="padding: 8px; border-bottom: 2px solid #333; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                  <tfoot>
                    <tr>
                      <td style="font-weight: bold; padding: 8px; text-align: right; border-top: 2px solid #333;">Total</td>
                      <td style="font-weight: bold; padding: 8px; text-align: right; border-top: 2px solid #333;">$${(session.amount_total / 100).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
                <h3 style="color: #0F172A; margin-top: 24px; border-top: 1px solid #eee; padding-top: 20px;">Shipping To:</h3>
                ${shippingHtml}
                <p style="margin-top: 24px;">Thanks,<br>The KitVault Team</p>
              </div>`,
            });
            console.log(
              `Order confirmation email sent successfully to ${customerEmail}.`
            );
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
          }
        } catch (err) {
          await client.query("ROLLBACK");
          console.error("Webhook database transaction failed:", err);
          return res.status(500).send("Server error while saving order.");
        } finally {
          client.release();
        }
      }

      res.status(200).json({ received: true });
    }
  );

  return router;
};
