const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    workoutName: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be greater than 0"],
    },

    caloriesBurned: {
      type: Number,
      required: [true, "Calories burned is required"],
      min: [0, "Calories burned cannot be negative"],
    },

    workoutDate: {
      type: Date,
      required: [true, "Workout date is required"],
    },

    // Search metadata used by semantic search and MongoDB Atlas Search.
    // These fields are server-managed and are never accepted from client payloads.
    searchText: {
      type: String,
      default: "",
      select: false,
    },

    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },

    embeddingModel: {
      type: String,
      default: null,
      select: false,
    },

    embeddingUpdatedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

workoutSchema.index({ user: 1, workoutDate: -1 });
workoutSchema.index({ user: 1, category: 1 });
workoutSchema.index({ user: 1, workoutName: 1 });

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;