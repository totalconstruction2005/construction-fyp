const express = require("express");
const router = express.Router();
const employeeController = require("./employee.controller");
const authMiddleware = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");

router.get("/", authMiddleware, adminOnly, employeeController.getAllEmployees);
router.post("/", authMiddleware, adminOnly, employeeController.createEmployee);
router.patch("/:id", authMiddleware, adminOnly, employeeController.updateEmployee);
router.delete("/:id", authMiddleware, adminOnly, employeeController.deleteEmployee);

module.exports = router;
