const express = require("express");
const router = express.Router();

const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const Investment = require("../models/Investment");

const PROFIT_RATE = 0.40;
const WAITING_PERIOD_MS = 24 * 60 * 60 * 1000;

// GET all withdrawals
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 });

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
      userId,
      amount,
      accountName,
      accountNumber,
      paymentMethod,
    } = req.body;

    if (
      !userId ||
      !amount ||
      !accountName ||
      !accountNumber
    ) {
      return res.status(400).json({
        message:
          "User ID, amount, account name and account number are required",
      });
    }

    const withdrawalAmount = Number(amount);

    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid withdrawal amount",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Find this customer's approved investments
    const investments = await Investment.find({
      userId,
      status: "Approved",
      approvedAt: { $ne: null },
    });

    if (investments.length === 0) {
      return res.status(400).json({
        message:
          "You have no approved investment available for withdrawal.",
      });
    }

    // Check whether at least one investment has completed 24 hours
    const now = Date.now();

    const maturedInvestments = investments.filter(
      (investment) => {
        const approvedTime =
          new Date(investment.approvedAt).getTime();

        return (
          now - approvedTime >=
          WAITING_PERIOD_MS
        );
      }
    );

    if (maturedInvestments.length === 0) {
      const earliestInvestment =
        investments.reduce(
          (earliest, investment) => {
            if (!earliest) return investment;

            return new Date(
              investment.approvedAt
            ) <
              new Date(
                earliest.approvedAt
              )
              ? investment
              : earliest;
          },
          null
        );

      const availableAt =
        new Date(
          earliestInvestment.approvedAt
        ).getTime() +
        WAITING_PERIOD_MS;

      return res.status(400).json({
        message:
          `Your investment is still locked. ` +
          `Withdrawal becomes available after 24 hours.`,
        availableAt: new Date(
          availableAt
        ).toISOString(),
      });
    }

    // Calculate the total amount available after maturity.
    const maturedDeposit = maturedInvestments.reduce(
      (total, investment) =>
        total + Number(investment.amount),
      0
    );

    const maturedBalance =
      maturedDeposit +
      maturedDeposit * PROFIT_RATE;

    // Existing pending/approved withdrawals must also be considered.
    const existingWithdrawals =
      await Withdrawal.find({
        userId,
        status: {
          $in: ["Pending", "Approved"],
        },
      });

    const alreadyReserved =
      existingWithdrawals.reduce(
        (total, withdrawal) =>
          total + Number(withdrawal.amount),
        0
      );

    const availableBalance =
      maturedBalance - alreadyReserved;

    if (
      withdrawalAmount >
      availableBalance
    ) {
      return res.status(400).json({
        message:
          `Insufficient withdrawable balance. ` +
          `Maximum available: ${availableBalance.toFixed(2)} Birr.`,
      });
    }

    const withdrawal = new Withdrawal({
      userId,
      amount: withdrawalAmount,
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
      withdrawableBalance:
        availableBalance,
    });
  } catch (error) {
    console.error(
      "CREATE WITHDRAWAL ERROR:",
      error
    );

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
      await Withdrawal.findById(
        req.params.id
      );

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found",
      });
    }

    withdrawal.status = status;

    await withdrawal.save();

    res.json({
      message:
        "Withdrawal status updated",
      withdrawal,
    });
  } catch (error) {
    console.error(
      "UPDATE WITHDRAWAL STATUS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
