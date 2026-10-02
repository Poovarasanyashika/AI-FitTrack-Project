const mongoose = require("mongoose");

const User = require("../models/User");
const Workout = require("../models/Workout");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (req) => {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedLimit = Number.parseInt(req.query.limit, 10);

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildCategoryDistribution = async () => {
  const categories = await Workout.aggregate([
    {
      $group: {
        _id: "$category",
        workoutCount: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        averageDuration: { $avg: "$duration" },
        totalCaloriesBurned: { $sum: "$caloriesBurned" },
      },
    },
    {
      $sort: {
        workoutCount: -1,
      },
    },
  ]);

  return categories.map((item) => ({
    category: item._id || "Uncategorized",
    workoutCount: item.workoutCount,
    totalDuration: item.totalDuration,
    averageDuration: Math.round(item.averageDuration || 0),
    totalCaloriesBurned: item.totalCaloriesBurned,
  }));
};

const buildRoleDistribution = async () => {
  const roles = await User.aggregate([
    {
      $project: {
        normalizedRole: {
          $ifNull: ["$role", "user"],
        },
      },
    },
    {
      $group: {
        _id: "$normalizedRole",
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return roles.map((item) => ({
    role: item._id,
    count: item.count,
  }));
};

// @desc    Admin dashboard
// @route   GET /api/admin/dashboard
// @access  Admin (read-only)
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalWorkouts,
      workoutTotals,
      categoryDistribution,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Workout.countDocuments(),
      Workout.aggregate([
        {
          $group: {
            _id: null,
            totalCaloriesBurned: { $sum: "$caloriesBurned" },
            totalDuration: { $sum: "$duration" },
            averageWorkoutDuration: { $avg: "$duration" },
          },
        },
      ]),
      buildCategoryDistribution(),
    ]);

    const totals = workoutTotals[0] || {
      totalCaloriesBurned: 0,
      totalDuration: 0,
      averageWorkoutDuration: 0,
    };

    res.status(200).json({
      success: true,
      message: "Admin dashboard retrieved successfully",
      data: {
        totalUsers,
        totalAdmins,
        totalRegularUsers: Math.max(totalUsers - totalAdmins, 0),
        totalWorkouts,
        totalCaloriesBurned: totals.totalCaloriesBurned || 0,
        totalWorkoutDuration: totals.totalDuration || 0,
        averageWorkoutDuration: Math.round(
          totals.averageWorkoutDuration || 0
        ),
        categoryDistribution: categoryDistribution.map((item) => ({
          category: item.category,
          count: item.workoutCount,
          totalCaloriesBurned: item.totalCaloriesBurned,
          totalDuration: item.totalDuration,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List users
// @route   GET /api/admin/users
// @access  Admin (read-only)
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = {};

    if (
      typeof req.query.role === "string" &&
      ["user", "admin"].includes(req.query.role)
    ) {
      filter.role = req.query.role;
    }

    if (
      typeof req.query.search === "string" &&
      req.query.search.trim()
    ) {
      const expression = new RegExp(
        escapeRegex(req.query.search.trim()),
        "i"
      );

      filter.$or = [
        { name: expression },
        { email: expression },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || "user",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all workouts
// @route   GET /api/admin/workouts
// @access  Admin (read-only)
const getWorkouts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = {};

    if (
      typeof req.query.search === "string" &&
      req.query.search.trim()
    ) {
      filter.workoutName = new RegExp(
        escapeRegex(req.query.search.trim()),
        "i"
      );
    }

    if (
      typeof req.query.category === "string" &&
      req.query.category.trim()
    ) {
      filter.category = new RegExp(
        `^${escapeRegex(req.query.category.trim())}$`,
        "i"
      );
    }

    const [workouts, total] = await Promise.all([
      Workout.find(filter)
        .populate("user", "name email role")
        .sort({ workoutDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Workout.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Admin workouts retrieved successfully",
      data: {
        workouts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Read-only admin reports and analytics
// @route   GET /api/admin/reports
// @access  Admin (read-only)
const getReports = async (req, res, next) => {
  try {
    const [categoryDistribution, roleDistribution] =
      await Promise.all([
        buildCategoryDistribution(),
        buildRoleDistribution(),
      ]);

    res.status(200).json({
      success: true,
      message: "Admin reports retrieved successfully",
      data: {
        categoryDistribution,
        roleDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    System health
// @route   GET /api/admin/system-health
// @access  Admin (read-only)
const getSystemHealth = async (req, res, next) => {
  try {
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const database =
      dbStates[mongoose.connection.readyState] || "unknown";

    res.status(200).json({
      success: true,
      message: "System health retrieved successfully",
      data: {
        api: "operational",
        database,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getWorkouts,
  getReports,
  getSystemHealth,
};
