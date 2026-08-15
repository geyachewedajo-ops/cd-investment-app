const express = require("express");
const router = express.Router();

const User = require("../models/User");

// ===============================
// GENERATE REFERRAL CODE
// ===============================

async function generateReferralCode() {
  let code;
  let exists = true;

  while (exists) {
    code =
      "OSUN-" +
      Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase();

    exists = await User.exists({
      referralCode: code,
    });
  }

  return code;
}

// ===============================
// REGISTER
// ===============================

router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      referralCode,
      ref,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username, email and password are required",
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Username or email already exists",
      });
    }

    // ===============================
    // FIND REFERRER
    // ===============================

    const suppliedReferralCode =
      (referralCode || ref || "")
        .trim()
        .toUpperCase();

    let referredBy = null;

    if (suppliedReferralCode) {
      const referrer = await User.findOne({
        referralCode: suppliedReferralCode,
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }

      referredBy = referrer._id;
    }

    // ===============================
    // CREATE PERSONAL REFERRAL CODE
    // ===============================

    const newReferralCode =
      await generateReferralCode();

    // ===============================
    // CREATE CUSTOMER
    // ===============================

    const user = new User({
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: "customer",

      balance: 0,

      referralCode: newReferralCode,

      referredBy: referredBy,

      referralBalance: 0,

      totalReferralEarnings: 0,
    });

    await user.save();

    // ===============================
    // RESPONSE
    // ===============================

    res.status(201).json({
      success: true,

      message:
        "Registration successful",

      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,

        referralCode:
          user.referralCode,

        referredBy:
          user.referredBy,

        referralBalance:
          user.referralBalance,

        totalReferralEarnings:
          user.totalReferralEarnings,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({
      username,
      password,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ===============================
// GET ALL USERS
// ===============================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ===============================
// CHANGE PASSWORD
// ===============================
router.put("/change-password", async (req, res) => {
  try {
    const {
      username,
      currentPassword,
      newPassword,
    } = req.body;

    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Username, current password and new password are required",
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 4 characters",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
