require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("./models/Plan");

const plans = [
  {
    name: "Quartz",
    minCapital: 1000,
    maxCapital: 4999,
    commodity: "Quartz",
    risk: "Low",
  },
  {
    name: "Silver",
    minCapital: 5000,
    maxCapital: 19999,
    commodity: "Silver",
    risk: "Medium",
  },
  {
    name: "Gold",
    minCapital: 20000,
    maxCapital: 49999,
    commodity: "Gold",
    risk: "High",
  },
  {
    name: "Diamond",
    minCapital: 50000,
    maxCapital: 999999,
    commodity: "Diamond",
    risk: "Very High",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Plan.deleteMany({});

    console.log("Old plans deleted");

    await Plan.insertMany(plans);

    console.log("New plans inserted");

    const saved = await Plan.find().sort({ minCapital: 1 });

    console.log(saved);

    await mongoose.connection.close();
  } catch (error) {
    console.error("SEED ERROR:", error);
    process.exit(1);
  }
}

seed();
