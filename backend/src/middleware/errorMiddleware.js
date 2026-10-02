const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  let message = err.message || "Internal server error";
  let code = "INTERNAL_SERVER_ERROR";

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Email is already registered";
    code = "DUPLICATE_EMAIL";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
    code = "INVALID_ID";
  } else if (statusCode === 400) {
    code = "BAD_REQUEST";
  } else if (statusCode === 401) {
    code = "UNAUTHORIZED";
  } else if (statusCode === 403) {
    code = "FORBIDDEN";
  } else if (statusCode === 404) {
    code = "NOT_FOUND";
  } else if (statusCode === 409) {
    code = "CONFLICT";
  } else if (statusCode === 503) {
    code = "SERVICE_UNAVAILABLE";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
    },
  });
};

module.exports = {
  errorHandler,
};