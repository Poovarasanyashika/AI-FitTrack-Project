const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Authentication token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Authentication token is required");
    }

    if (!process.env.JWT_SECRET) {
      res.status(500);
      throw new Error("JWT configuration is unavailable");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401);
      throw new Error("User associated with this token no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.status(401);
      error.message = "Invalid authentication token";
    }

    if (error.name === "TokenExpiredError") {
      res.status(401);
      error.message = "Authentication token has expired";
    }

    next(error);
  }
};

module.exports = {
  protect,
};