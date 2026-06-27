const express = require("express");
const router = express.Router();
const contractorPlanController = require("./contractorPlan.controller");
const protect = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");
const optionalAuth = require("../../middleware/optionalAuth");

router.post("/", protect, adminOnly, contractorPlanController.createPlan);
router.get("/", optionalAuth, contractorPlanController.getAllPlans);
router.put("/:id", protect, adminOnly, contractorPlanController.updatePlan);
router.delete("/:id", protect, adminOnly, contractorPlanController.deletePlan);
router.patch("/reorder", protect, adminOnly, contractorPlanController.reorderPlans);

module.exports = router;