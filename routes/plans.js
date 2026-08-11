const express = require("express");
const router = express.Router();

const Plan = require("../models/Plan");

// GET all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().sort({
      minCapital: 1,
    });

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE plan
router.post("/", async (req, res) => {
  try {
    const plan = new Plan(req.body);

    await plan.save();

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
