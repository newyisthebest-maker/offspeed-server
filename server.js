require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Allow your frontend domain to call this server
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

// Health check — Render uses this to confirm the server is running
app.get("/", (req, res) => {
  res.send("Offspeed server is running");
});

// Send welcome email — called from app.js after login
app.post("/send-welcome-email", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "No email provided" });

  try {
    await resend.emails.send({
      from: "OFFspeed Baseball <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to OFFspeed Baseball! ⚾",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Welcome to OFFspeed Baseball${name ? `, ${name}` : ""}! ⚾</h2>
          <p>Thanks for signing in — we're stoked to have you.</p>
          <p>You're now part of the OFFspeed community. Browse our gear, check out the latest listings, and stay tuned for new drops.</p>
          <p style="margin-top: 32px;">See you on the diamond,<br/><strong>The OFFspeed Team</strong></p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a PaymentIntent — called when customer clicks "Pay"
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
