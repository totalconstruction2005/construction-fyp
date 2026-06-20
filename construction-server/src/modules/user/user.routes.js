const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const authMiddleware = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");

// Auth routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);

// Protected authenticated user routes
router.patch("/change-password", authMiddleware, userController.changePassword);

// Admin routes
router.get("/:id", authMiddleware, adminOnly, userController.getUserById);

module.exports = router;

