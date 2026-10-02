const Workout = require("../models/Workout");

const {
  generateWorkoutRecommendation,
  generateFitnessInsights,
  generateFitnessChatResponse,
} = require("../services/geminiService");

// @desc    Generate AI-powered workout recommendation
// @route   POST /api/ai/workout-recommendation
// @access  Private
const getWorkoutRecommendation = async (req, res, next) => {
  try {
    const { age, fitnessGoal, experienceLevel } = req.body;

    if (
      age === undefined ||
      age === null ||
      age === "" ||
      !fitnessGoal ||
      !experienceLevel
    ) {
      res.status(400);
      throw new Error(
        "Age, fitness goal and experience level are required"
      );
    }

    const parsedAge = Number(age);

    if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
      res.status(400);
      throw new Error("Age must be a valid positive integer");
    }

    if (
      typeof fitnessGoal !== "string" ||
      !fitnessGoal.trim()
    ) {
      res.status(400);
      throw new Error("Fitness goal is required");
    }

    if (
      typeof experienceLevel !== "string" ||
      !experienceLevel.trim()
    ) {
      res.status(400);
      throw new Error("Experience level is required");
    }

    const recommendation = await generateWorkoutRecommendation({
      age: parsedAge,
      fitnessGoal: fitnessGoal.trim(),
      experienceLevel: experienceLevel.trim(),
    });

    res.status(200).json({
      success: true,
      message: "Workout recommendation generated successfully",
      data: {
        recommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI-powered fitness insights from workout history
// @route   GET /api/ai/fitness-insights
// @access  Private
const getFitnessInsights = async (req, res, next) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id,
    })
      .sort({
        workoutDate: 1,
        createdAt: 1,
      })
      .lean();

    if (workouts.length === 0) {
      res.status(404);
      throw new Error(
        "No workout history found to generate fitness insights"
      );
    }

    const insights = await generateFitnessInsights(workouts);

    res.status(200).json({
      success: true,
      message: "Fitness insights generated successfully",
      data: {
        workoutCount: workouts.length,
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with Gemini-powered AI FitTrack Fitness Assistant
// @route   POST /api/chatbot
// @access  Private
const fitnessChat = async (req, res, next) => {
  try {
    const {
      message,
      goal,
      age,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      experienceLevel,
    } = req.body;

    if (
      message === undefined ||
      message === null ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      res.status(400);
      throw new Error("Message is required");
    }

    const optionalTextFields = {
      goal,
      experienceLevel,
    };

    Object.entries(optionalTextFields).forEach(([field, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        (typeof value !== "string" || !value.trim())
      ) {
        res.status(400);
        throw new Error(`${field} must be a non-empty string when provided`);
      }
    });

    const optionalNumberFields = {
      age,
      heightCm,
      currentWeightKg,
      targetWeightKg,
    };

    Object.entries(optionalNumberFields).forEach(([field, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      const parsed = Number(value);

      if (!Number.isFinite(parsed) || parsed <= 0) {
        res.status(400);
        throw new Error(`${field} must be a positive number when provided`);
      }

      if (field === "age" && !Number.isInteger(parsed)) {
        res.status(400);
        throw new Error("age must be a positive integer when provided");
      }
    });

    const response = await generateFitnessChatResponse({
      message: message.trim(),
      goal: typeof goal === "string" ? goal.trim() : goal,
      age: age === undefined || age === null || age === "" ? age : Number(age),
      heightCm:
        heightCm === undefined || heightCm === null || heightCm === ""
          ? heightCm
          : Number(heightCm),
      currentWeightKg:
        currentWeightKg === undefined ||
        currentWeightKg === null ||
        currentWeightKg === ""
          ? currentWeightKg
          : Number(currentWeightKg),
      targetWeightKg:
        targetWeightKg === undefined ||
        targetWeightKg === null ||
        targetWeightKg === ""
          ? targetWeightKg
          : Number(targetWeightKg),
      experienceLevel:
        typeof experienceLevel === "string"
          ? experienceLevel.trim()
          : experienceLevel,
    });

    res.status(200).json({
      success: true,
      message: "Fitness chatbot response generated successfully",
      data: {
        response,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkoutRecommendation,
  getFitnessInsights,
  fitnessChat,
};