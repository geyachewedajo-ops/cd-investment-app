const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
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
// API ROUTES
// ===============================

app.use("/auth", authRoutes);
app.use("/investments", investmentRoutes);
app.use("/withdrawals", withdrawalRoutes);
app.use("/plans", planRoutes);

// ===============================
// API HEALTH CHECK
// ===============================

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Osunburg Investment API is running",
  });
});

// ===============================
// SERVE REACT FRONTEND
// ===============================

const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/auth") &&
    !req.path.startsWith("/investments") &&
    !req.path.startsWith("/withdrawals") &&
    !req.path.startsWith("/plans")
  ) {
    return res.sendFile(path.join(distPath, "index.html"));
  }

  next();
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
