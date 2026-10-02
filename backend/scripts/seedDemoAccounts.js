const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Workout = require("../src/models/Workout");

const DEMO_USER = {
  name: "Poovarasan Team Demo User",
  email: "demo.user@poovarasanfittrack.local",
  password: "PoovarasanDemo@12345",
  role: "user",
};

const DEMO_ADMIN = {
  name: "Poovarasan Team Demo Admin",
  email: "demo.admin@poovarasanfittrack.local",
  password: "PoovarasanAdmin@12345",
  role: "admin",
};

const SAMPLE_WORKOUTS = [
    { workoutName: "Evening Cardio", category: "Cardio", duration: 40, caloriesBurned: 310, workoutDate: new Date("2026-10-01") },
    { workoutName: "Core Circuit", category: "Core", duration: 30, caloriesBurned: 190, workoutDate: new Date("2026-09-30") }
];

async function upsertAccount(account) {
  let user = await User.findOne({ email: account.email }).select("+password");
  if (!user) {
    user = await User.create(account);
    return user;
  }
  user.name = account.name;
  user.role = account.role;
  user.password = account.password;
  await user.save();
  return user;
}

async function run() {
  try {
    await connectDB();
    console.log("\n=== AI FITTRACK POOVARASAN TEAM DEMO SEED ===");

    const demoUser = await upsertAccount(DEMO_USER);
    const demoAdmin = await upsertAccount(DEMO_ADMIN);

    for (const item of SAMPLE_WORKOUTS) {
      await Workout.findOneAndUpdate(
        { user: demoUser._id, workoutName: item.workoutName },
        { ...item, user: demoUser._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(`[PASS] Demo User : ${demoUser.email}`);
    console.log(`[PASS] Demo Admin: ${demoAdmin.email}`);
    console.log(`[PASS] Sample workouts: ${SAMPLE_WORKOUTS.length}`);
    console.log(`[PASS] Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("[FAIL]", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
