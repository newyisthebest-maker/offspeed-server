import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Replace re_xxxxxxxxx with your real Resend API key
const resend = new Resend("re_xxxxxxxxx");

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
