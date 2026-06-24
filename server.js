require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Allow your frontend domain to call this server
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

// Health check — Render uses this to confirm the server is running
app.get("/", (req, res) => {
  res.send("Offspeed server is running");
});

// Create a PaymentIntent — called when customer clicks "Pay"
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amountInCents, customerEmail } = req.body;

    if (!amountInCents || amountInCents < 50) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,           // Stripe uses cents, e.g. $19.99 = 1999
      currency: "usd",
      receipt_email: customerEmail,
      metadata: {
        source: "offspeed-baseball"
      }
    });

    // Send back only the client_secret — the frontend needs this to confirm payment
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("PaymentIntent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));