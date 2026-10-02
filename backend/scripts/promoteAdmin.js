const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("../src/config/db");
const User = require("../src/models/User");


const run = async () => {
  try {
    const emailArgument =
      process.argv[2];


    if (
      !emailArgument ||
      !emailArgument.trim()
    ) {
      console.error(
        "Usage: node scripts/promoteAdmin.js user@example.com"
      );

      process.exitCode = 1;

      return;
    }


    const normalizedEmail =
      emailArgument
        .trim()
        .toLowerCase();


    await connectDB();


    console.log(
      "\n=== ADMIN PROMOTION ==="
    );


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {
      console.error(
        `User not found: ${normalizedEmail}`
      );

      process.exitCode = 1;

      return;
    }


    if (
      user.role ===
      "admin"
    ) {
      console.log(
        `${user.email} is already an admin.`
      );

      return;
    }


    user.role =
      "admin";

    await user.save();


    console.log(
      `Name: ${user.name}`
    );

    console.log(
      `Email: ${user.email}`
    );

    console.log(
      `Role: ${user.role}`
    );

    console.log(
      "\n[PASS] User promoted to admin"
    );
  } catch (error) {
    console.error(
      "\n[FAIL]",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};


run();