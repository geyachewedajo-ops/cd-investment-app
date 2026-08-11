const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const investmentRoutes = require("./routes/investments");
const withdrawalRoutes = require("./routes/withdrawals");
const planRoutes = require("./routes/plans");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// ROUTES
// ===============================

app.use("/auth", authRoutes);
app.use("/investments", investmentRoutes);
app.use("/withdrawals", withdrawalRoutes);
app.use("/plans", planRoutes);

// ===============================
// HOME / HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Osunburg Investment API is running",
  });
});

// ===============================
// MONGODB
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB Error:", error.message);
  });

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
