const express = require("express");
const router = express.Router();

const Withdrawal = require("../models/Withdrawal");

// GET all withdrawals
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({
      createdAt: -1,
    });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE withdrawal
router.post("/", async (req, res) => {
  try {
    const {
      amount,
      accountName,
      accountNumber,
      paymentMethod,
    } = req.body;

    if (
      !amount ||
      !accountName ||
      !accountNumber
    ) {
      return res.status(400).json({
        message:
          "Amount, account name and account number are required",
      });
    }

    const withdrawal = new Withdrawal({
      amount,
      accountName,
      accountNumber,
      paymentMethod:
        paymentMethod || "CBE",
      status: "Pending",
    });

    await withdrawal.save();

    res.status(201).json({
      message:
        "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE withdrawal status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      ![
        "Pending",
        "Approved",
        "Rejected",
        "Paid",
      ].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid withdrawal status",
      });
    }

    const withdrawal =
      await Withdrawal.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found",
      });
    }

    res.json({
      message:
        "Withdrawal status updated",
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
