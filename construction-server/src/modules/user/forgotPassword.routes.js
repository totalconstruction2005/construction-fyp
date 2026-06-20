const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const forgotPasswordController = require("./forgotPassword.controller");

/**
 * Rate limiters
 */

// Strict rate limit for forgot-password endpoint (prevent enumeration attacks)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes per IP
  message: "Too many password reset requests from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// Moderate rate limit for verify-code endpoint
const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes per IP
  message: "Too many code verification attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// Moderate rate limit for reset-password endpoint
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes per IP
  message: "Too many password reset attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

/**
 * Routes
 */

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset code
 * @access  Public
 */
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordController.forgotPassword
);

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verify password reset code
 * @access  Public
 */
router.post(
  "/verify-reset-code",
  verifyCodeLimiter,
  forgotPasswordController.verifyResetCode
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with verified code
 * @access  Public
 */
router.post(
  "/reset-password",
  resetPasswordLimiter,
  forgotPasswordController.resetPassword
);

module.exports = router;
