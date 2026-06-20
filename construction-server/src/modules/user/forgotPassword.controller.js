const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("./user.model");
const { sendEmail, getPasswordResetEmailTemplate } = require("../../utils/email");

/**
 * Helper: Generate 6-digit reset code
 */
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Helper: Hash token using SHA256
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Helper: Validate password strength
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  return errors;
};

/**
 * @desc    Request password reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        errorCode: "INVALID_EMAIL",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        errorCode: "INVALID_EMAIL_FORMAT",
      });
    }

    // Find user - normalize email to lowercase
    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: Don't reveal if email exists (prevent enumeration attacks)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset code has been sent.",
      });
    }

    // Generate reset code
    const resetCode = generateResetCode();
    const resetToken = hashToken(resetCode);
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save to database
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send email
    try {
      const emailTemplate = getPasswordResetEmailTemplate(resetCode, 15);
      await sendEmail(
        user.email,
        "Reset Your Password - Total Construction",
        emailTemplate
      );
    } catch (emailError) {
      // Clear reset token if email fails
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      console.error("Email send error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
        errorCode: "EMAIL_SEND_FAILED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      errorCode: "SERVER_ERROR",
    });
  }
};

/**
 * @desc    Verify reset code
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate inputs
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
        errorCode: "MISSING_FIELDS",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Code must be a 6-digit number",
        errorCode: "INVALID_CODE_FORMAT",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // Check if reset token exists and isn't expired
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new code.",
        errorCode: "NO_RESET_REQUEST",
      });
    }

    // Check expiration
    if (new Date() > user.passwordResetExpires) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset code has expired. Please request a new code.",
        errorCode: "CODE_EXPIRED",
      });
    }

    // Hash provided code and compare
    const hashedCode = hashToken(code);
    if (hashedCode !== user.passwordResetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code. Please check and try again.",
        errorCode: "INVALID_CODE",
      });
    }

    // Code is valid
    res.status(200).json({
      success: true,
      message: "Code verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the code.",
      errorCode: "SERVER_ERROR",
    });
  }
};

/**
 * @desc    Reset password with code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and password are required",
        errorCode: "MISSING_FIELDS",
      });
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Code must be a 6-digit number",
        errorCode: "INVALID_CODE_FORMAT",
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        errorCode: "PASSWORD_MISMATCH",
      });
    }

    // Validate password strength
    const strengthErrors = validatePasswordStrength(newPassword);
    if (strengthErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet requirements",
        details: strengthErrors,
        errorCode: "WEAK_PASSWORD",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // Check if reset token exists
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new code.",
        errorCode: "NO_RESET_REQUEST",
      });
    }

    // Check expiration
    if (new Date() > user.passwordResetExpires) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset code has expired. Please request a new code.",
        errorCode: "CODE_EXPIRED",
      });
    }

    // Verify code
    const hashedCode = hashToken(code);
    if (hashedCode !== user.passwordResetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code. Please check and try again.",
        errorCode: "INVALID_CODE",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password.",
      errorCode: "SERVER_ERROR",
    });
  }
};
