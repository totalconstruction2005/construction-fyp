const User = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const createToken = (user) => {
  if (!JWT_SECRET) {
    const error = new Error("JWT secret not configured");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Helper function to handle errors
 */
const handleError = (error, res, defaultMessage = "An error occurred") => {
  console.error(error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors)
      .map((err) => err.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message: messages,
      error: "ValidationError",
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `A user with this ${field} already exists`,
      error: "DuplicateKeyError",
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
      error: "InvalidIdError",
    });
  }

  // Bcrypt errors
  if (error.name === "Error" && error.message.includes("bcrypt")) {
    return res.status(500).json({
      success: false,
      message: "Password processing error",
      error: "PasswordProcessingError",
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || defaultMessage,
    error: error.name || "ServerError",
  });
};

/**
 * @desc    User Signup - Create new user
 * @route   POST /api/users/signup
 * @access  Public
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation - Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, and password are required",
        error: "ValidationError",
      });
    }

    // Validation - Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        error: "ValidationError",
      });
    }

    // Validation - Password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        error: "ValidationError",
      });
    }


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
        error: "DuplicateKeyError",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
      token,
    });
  } catch (error) {
    handleError(error, res, "Failed to create user");
  }
};

/**
 * @desc    User Login - Authenticate user
 * @route   POST /api/users/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation - Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
        error: "ValidationError",
      });
    }

    // Validation - Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        error: "ValidationError",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "AuthenticationError",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "AuthenticationError",
      });
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    const token = createToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userResponse,
      token,
    });
  } catch (error) {
    handleError(error, res, "Failed to login");
  }
};

/**
 * @desc    Get user by id (admin only)
 * @route   GET /api/user/:id
 * @access  Protected (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    handleError(error, res, "Failed to fetch user");
  }
};
/**
 * @desc    Change user password (authenticated users only)
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id;

    // Validation - Required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: currentPassword, newPassword, confirmPassword",
        error: "ValidationError",
      });
    }

    // Validation - Passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
        error: "ValidationError",
      });
    }

    // Validation - Password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
        error: "WeakPassword",
      });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one number",
        error: "WeakPassword",
      });
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one letter",
        error: "WeakPassword",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "UserNotFound",
      });
    }

    // Compare current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
        error: "IncorrectPassword",
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password.",
        error: "SamePassword",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    handleError(error, res, "Failed to change password");
  }
};