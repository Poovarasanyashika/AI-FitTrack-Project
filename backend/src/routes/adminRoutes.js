const express = require("express");

const {
  getDashboard,
  getUsers,
  getWorkouts,
  getReports,
  getSystemHealth,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

/*
  BA-AIFT-001 v1.2:
  Every admin API requires both a valid JWT and the current DB user's
  admin role. The approved Admin scope is read-only.
*/
router.use(protect, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/workouts", getWorkouts);
router.get("/reports", getReports);
router.get("/system-health", getSystemHealth);

module.exports = router;
