/**
 * Centralized Error Handler Middleware
 * Catches all async errors and formats consistent JSON responses
 */

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, {
    message: err.message,
    statusCode: err.statusCode || 500,
    errorCode: err.errorCode,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", ") || "Validation failed",
      data: null,
      errorCode: "VALIDATION_ERROR",
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `A record with this ${field} already exists`;
    errorCode = "DUPLICATE_KEY_ERROR";
    return res.status(400).json({
      success: false,
      message,
      data: null,
      errorCode,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      data: null,
      errorCode: "INVALID_ID_FORMAT",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or malformed token",
      data: null,
      errorCode: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again.",
      data: null,
      errorCode: "TOKEN_EXPIRED",
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      errorCode: err.errorCode,
    });
  }

  // Generic error response
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "An error occurred. Please try again." : message,
    data: null,
    errorCode,
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler, AppError };
