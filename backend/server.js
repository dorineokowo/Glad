const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST route to handle the contact form submission
app.post("/api/send-email", async (req, res) => {
  const { firstName, lastName, email, phone, company, inquiry } = req.body;

  if (!firstName || !lastName || !email || !phone || !inquiry) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled out.",
    });
  }

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "onboarding@resend.dev",
        to: process.env.TO_EMAIL,
        subject: `New Inquiry from ${firstName} ${lastName}`,
        html: `
          <h1>New Inquiry</h1>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${company || "Not Provided"}</p>
          <p><strong>Inquiry:</strong> ${inquiry}</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
