const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");

/**
 * Optional auth middleware - sets req.user if token exists, but doesn't reject if no token
 * Used for routes that have different behavior for authenticated vs unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token - continue without user
      return next();
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Invalid token - continue without user (don't reject)
    next();
  }
};

module.exports = optionalAuth;
