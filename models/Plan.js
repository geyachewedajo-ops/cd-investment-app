const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    minCapital: {
      type: Number,
      required: true,
    },

    maxCapital: {
      type: Number,
      required: true,
    },

    commodity: {
      type: String,
      required: true,
    },

    risk: {
      type: String,
      required: true,
    },
image: {
  type: String,
  default: "",
},

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);
