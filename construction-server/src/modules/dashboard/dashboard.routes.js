const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");
const authMiddleware = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");

router.get("/admin", authMiddleware, adminOnly, dashboardController.getAdminDashboard);

module.exports = router;
