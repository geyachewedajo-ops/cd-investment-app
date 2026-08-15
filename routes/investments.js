const express = require("express");
const router = express.Router();

const Investment = require("../models/Investment");
const User = require("../models/User");

// =========================
// GET ALL INVESTMENTS
// =========================

router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find()
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.error("GET INVESTMENTS ERROR:", error);

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
    console.error("GET INVESTMENT ERROR:", error);

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
      paymentMethod: paymentMethod || "CBE",
      status: "Pending",
      approvedAt: null,
      referralPaid: false,
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

    // =========================
    // APPROVED
    // =========================

    if (status === "Approved") {
      investment.status = "Approved";
      investment.approvedAt = new Date();

      // =========================
      // 10% REFERRAL COMMISSION
      // =========================

      if (!investment.referralPaid) {
        const investor =
          await User.findById(
            investment.userId
          );

        if (
          investor &&
          investor.referredBy
        ) {
          const referrer =
            await User.findOne({
              referralCode:
                investor.referredBy,
            });

          if (referrer) {
            const referralAmount =
              Number(investment.amount) *
              0.10;

            // Add referral balance
            referrer.referralBalance =
              Number(
                referrer.referralBalance || 0
              ) + referralAmount;

            // Add total earnings
            referrer.totalReferralEarnings =
              Number(
                referrer.totalReferralEarnings || 0
              ) + referralAmount;

            await referrer.save();

            // Prevent duplicate payment
            investment.referralPaid = true;

            console.log(
              "REFERRAL COMMISSION PAID:",
              referralAmount,
              "ETB to",
              referrer.username
            );
          }
        }
      }
    }

    // =========================
    // REJECTED / PENDING
    // =========================

    if (
      status === "Rejected" ||
      status === "Pending"
    ) {
      investment.status = status;
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

// =========================
// EXPORT
// =========================

module.exports = router;
