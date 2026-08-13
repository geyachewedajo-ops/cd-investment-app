const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    planName: {
      type: String,
      required: true
    },

    commodity: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    transactionId: {
      type: String,
      required: true
    },

    paymentMethod: {
      type: String,
      default: "CBE"
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected"
      ],
      default: "Pending"
    },

    approvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "Investment",
    investmentSchema
  );
