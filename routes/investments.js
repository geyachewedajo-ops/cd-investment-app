const express = require("express");
const router = express.Router();

const Investment = require("../models/Investment");

// GET all investments
router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find().sort({
      createdAt: -1,
    });

    res.json(investments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET one investment
router.get("/:id", async (req, res) => {
  try {
    const investment = await Investment.findById(
      req.params.id
    );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE investment
router.post("/", async (req, res) => {
  try {
    const {
      planId,
      planName,
      commodity,
      amount,
      transactionId,
      paymentMethod,
    } = req.body;

    if (
      !planId ||
      !planName ||
      !commodity ||
      !amount ||
      !transactionId
    ) {
      return res.status(400).json({
        message: "All investment fields are required",
      });
    }

    const investment = new Investment({
      planId,
      planName,
      commodity,
      amount,
      transactionId,
      paymentMethod: paymentMethod || "CBE",
      status: "Pending",
    });

    await investment.save();

    res.status(201).json({
      message: "Investment submitted successfully",
      investment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE investment status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["Pending", "Approved", "Rejected"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message: "Invalid investment status",
      });
    }

    const investment =
      await Investment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    res.json({
      message: "Investment status updated",
      investment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
