const express = require("express");
const router = express.Router();
const floorPlanController = require("./floorPlan.controller");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/upload");

// Admin-only middleware check
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/floor-plans - Get all floor plans
router.get("/", floorPlanController.getAllFloorPlans);

// GET /api/admin/floor-plans/:id - Get single floor plan
router.get("/:id", floorPlanController.getFloorPlanById);

// POST /api/admin/floor-plans - Create new floor plan
router.post("/", upload.single("image"), floorPlanController.createFloorPlan);

// PUT /api/admin/floor-plans/:id - Update floor plan
router.put("/:id", upload.single("image"), floorPlanController.updateFloorPlan);

// DELETE /api/admin/floor-plans/:id - Delete floor plan
router.delete("/:id", floorPlanController.deleteFloorPlan);

module.exports = router;
