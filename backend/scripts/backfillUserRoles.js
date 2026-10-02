const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("../src/config/db");
const User = require("../src/models/User");


const run = async () => {
  try {
    await connectDB();

    console.log(
      "\n=== USER ROLE BACKFILL ==="
    );


    const result =
      await User.updateMany(
        {
          $or: [
            {
              role: {
                $exists: false,
              },
            },
            {
              role: null,
            },
            {
              role: "",
            },
          ],
        },
        {
          $set: {
            role: "user",
          },
        }
      );


    console.log(
      `Matched users: ${result.matchedCount}`
    );

    console.log(
      `Updated users: ${result.modifiedCount}`
    );


    const users =
      await User.find({})
        .select(
          "name email role createdAt"
        )
        .sort({
          createdAt: 1,
        })
        .lean();


    console.log(
      "\n=== CURRENT USERS ==="
    );


    if (!users.length) {
      console.log(
        "No users found."
      );
    }


    users.forEach(
      (
        user,
        index
      ) => {
        console.log(
          `${index + 1}. ${user.name} | ${user.email} | role=${user.role || "user"}`
        );
      }
    );


    console.log(
      "\n[PASS] Role backfill completed"
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