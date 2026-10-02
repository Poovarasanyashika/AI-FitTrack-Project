const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("../src/config/db");
const User = require("../src/models/User");


const DEMO_ADMIN = {
  name: "Poovarasan Team Demo Admin",
  email: "demo.admin@poovarasanfittrack.local",
  password: "PoovarasanAdmin@12345",
};


const run = async () => {
  try {
    await connectDB();

    console.log(
      "\n=== AI FITTRACK DEMO ADMIN SEED ==="
    );


    let admin =
      await User.findOne({
        email: DEMO_ADMIN.email,
      });


    if (!admin) {
      admin =
        await User.create({
          name: DEMO_ADMIN.name,
          email: DEMO_ADMIN.email,
          password: DEMO_ADMIN.password,
          role: "admin",
        });


      console.log(
        "[CREATED] Poovarasan Team Demo Admin account"
      );
    } else {
      admin.name =
        DEMO_ADMIN.name;

      admin.role =
        "admin";

      admin.password =
        DEMO_ADMIN.password;

      await admin.save();


      console.log(
        "[UPDATED] Poovarasan Team Demo Admin account"
      );
    }


    console.log(
      `Name : ${admin.name}`
    );

    console.log(
      `Email: ${admin.email}`
    );

    console.log(
      `Role : ${admin.role}`
    );

    console.log(
      "\n[PASS] Poovarasan Team Demo Admin ready"
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