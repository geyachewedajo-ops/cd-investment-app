



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
    image: "/images/quartz.jpeg",
  },

  {
    name: "Silver",
    minCapital: 5000,
    maxCapital: 19999,
    commodity: "Silver",
    risk: "Medium",
    image: "/images/silver.jpeg",
  },

  {
    name: "Gold",
    minCapital: 20000,
    maxCapital: 49999,
    commodity: "Gold",
    risk: "High",
    image: "/images/gold.jpeg",
  },

  {
    name: "Diamond",
    minCapital: 50000,
    maxCapital: 999999,
    commodity: "Diamond",
    risk: "Very High",
    image: "/images/diamond.jpeg",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Plan.deleteMany({});

    console.log("Old plans deleted");

    await Plan.insertMany(plans);

    console.log("New plans with local images inserted");

    const saved = await Plan.find().sort({
      minCapital: 1,
    });

    console.log("\nSaved Plans:");

    saved.forEach((plan) => {
      console.log({
        name: plan.name,
        minCapital: plan.minCapital,
        maxCapital: plan.maxCapital,
        commodity: plan.commodity,
        risk: plan.risk,
        image: plan.image,
      });
    });

    await mongoose.connection.close();

    console.log("\nMongoDB connection closed");
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("SEED ERROR:", error);
    process.exit(1);
  }
}

seed();
