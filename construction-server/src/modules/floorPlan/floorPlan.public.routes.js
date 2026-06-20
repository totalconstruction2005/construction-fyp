const express = require("express");
const router = express.Router();
const floorPlanController = require("./floorPlan.controller");

// TEST ROUTE - Verify public routes are working
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Public routes are accessible",
    timestamp: new Date().toISOString(),
  });
});

// PUBLIC ROUTES (no authentication required)
// GET /api/floor-plans/public - Get all active floor plans
router.get("/public", floorPlanController.getPublicFloorPlans);

// DEVELOPMENT ONLY - Seed sample data
// POST /api/floor-plans/seed - Create sample floor plans
router.post("/seed", floorPlanController.seedSampleFloorPlans);

module.exports = router;
