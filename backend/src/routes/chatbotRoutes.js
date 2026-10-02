const express = require("express");

const {
  fitnessChat,
} = require("../controllers/aiController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// @desc    Gemini-powered AI FitTrack Fitness Chatbot
// @route   POST /api/chatbot
// @access  Private
router.post("/", protect, fitnessChat);

module.exports = router;