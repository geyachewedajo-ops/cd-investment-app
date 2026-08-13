





const express = require("express");
const router = express.Router();

const Investment = require("../models/Investment");

// =========================
// GET ALL INVESTMENTS
// =========================

router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find()
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.error(
      "GET INVESTMENTS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// GET ONE INVESTMENT
// =========================

router.get("/:id", async (req, res) => {
  try {
    const investment =
      await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    res.json(investment);
  } catch (error) {
    console.error(
      "GET INVESTMENT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// CREATE INVESTMENT
// =========================

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      planId,
      planName,
      commodity,
      amount,
      transactionId,
      paymentMethod,
    } = req.body;

    if (
      !userId ||
      !planId ||
      !planName ||
      !commodity ||
      !amount ||
      !transactionId
    ) {
      return res.status(400).json({
        message:
          "All investment fields are required",
      });
    }

    const investment = new Investment({
      userId,
      planId,
      planName,
      commodity,
      amount: Number(amount),
      transactionId,
      paymentMethod:
        paymentMethod || "CBE",
      status: "Pending",
      approvedAt: null,
    });

    await investment.save();

    res.status(201).json({
      message:
        "Investment submitted successfully",
      investment,
    });
  } catch (error) {
    console.error(
      "CREATE INVESTMENT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// UPDATE INVESTMENT STATUS
// =========================

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      ![
        "Pending",
        "Approved",
        "Rejected",
      ].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid investment status",
      });
    }

    const investment =
      await Investment.findById(
        req.params.id
      );

    if (!investment) {
      return res.status(404).json({
        message:
          "Investment not found",
      });
    }

    investment.status = status;

    // Start the 24-hour timer
    // when admin approves
    if (status === "Approved") {
      investment.approvedAt =
        new Date();
    }

    // Clear timer if rejected
    // or moved back to pending
    if (
      status === "Rejected" ||
      status === "Pending"
    ) {
      investment.approvedAt = null;
    }

    await investment.save();

    res.json({
      message:
        "Investment status updated",
      investment,
    });
  } catch (error) {
    console.error(
      "UPDATE INVESTMENT STATUS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
