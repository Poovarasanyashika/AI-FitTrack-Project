const User = require("../models/User");
const generateToken = require("../utils/generateToken");


const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;


    if (
      !name ||
      !email ||
      !password
    ) {
      res.status(400);

      throw new Error(
        "Name, email and password are required"
      );
    }


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });


    if (existingUser) {
      res.status(409);

      throw new Error(
        "Email is already registered"
      );
    }


    /*
      Security:
      Registration never accepts
      role from the request body.
    */
    const user =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: "user",
      });


    const token =
      generateToken(
        user._id.toString()
      );


    res.status(201).json({
      success: true,

      message:
        "User registered successfully",

      data: {
        user:
          serializeUser(user),

        token,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;


    if (
      !email ||
      !password
    ) {
      res.status(400);

      throw new Error(
        "Email and password are required"
      );
    }


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      }).select("+password");


    if (!user) {
      res.status(401);

      throw new Error(
        "Invalid credentials"
      );
    }


    const passwordMatches =
      await user.comparePassword(
        password
      );


    if (!passwordMatches) {
      res.status(401);

      throw new Error(
        "Invalid credentials"
      );
    }


    const token =
      generateToken(
        user._id.toString()
      );


    res.status(200).json({
      success: true,

      message:
        "Login successful",

      data: {
        user:
          serializeUser(user),

        token,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get authenticated user's profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );


    if (!user) {
      res.status(404);

      throw new Error(
        "User not found"
      );
    }


    res.status(200).json({
      success: true,

      message:
        "Profile retrieved successfully",

      data: {
        user:
          serializeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  registerUser,
  loginUser,
  getProfile,
};