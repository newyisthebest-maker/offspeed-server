require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Offspeed server is running");
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amountInCents, customerEmail } = req.body;
    if (!amountInCents || amountInCents < 50) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      receipt_email: customerEmail,
      metadata: {
        source: "offspeed-baseball"
      }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("PaymentIntent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
