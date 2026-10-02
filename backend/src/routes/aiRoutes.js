const express = require("express");

const {
  getWorkoutRecommendation,
  getFitnessInsights,
} = require("../controllers/aiController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/workout-recommendation",
  protect,
  getWorkoutRecommendation
);

router.get(
  "/fitness-insights",
  protect,
  getFitnessInsights
);

module.exports = router;