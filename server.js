require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🔑 Replace re_xxxxxxxxx with your real Resend API key
const resend = new Resend("re_xxxxxxxxx");

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

app.post("/send-welcome-email", async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "offspeedbaseball.co1@gmail.com",
      subject: "thanks for signing in!",
      html: "<p>thanks for shopping with offspeedbaseball.co now that you have signed in you may earn discount codes and future rewards!</p>",
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
