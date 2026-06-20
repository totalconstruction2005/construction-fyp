const express = require("express");
const router = express.Router();
const contractorRequestController = require("./contractorRequest.controller");
const authMiddleware = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");
const upload = require("../../middleware/upload");

router.post(
  "/",
  authMiddleware,
  upload.single("mapFile"),
  contractorRequestController.createContractorRequest
);

// Get my contractor requests (client)
router.get(
  "/my",
  authMiddleware,
  contractorRequestController.getMyContractorRequests
);

// Admin routes (must come before /:id route)
router.get(
  "/admin",
  authMiddleware,
  adminOnly,
  contractorRequestController.getAllContractorRequests
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminOnly,
  contractorRequestController.updateContractorRequestStatus
);

// Get contractor request by ID (must come after /admin routes)
router.get(
  "/:id",
  authMiddleware,
  contractorRequestController.getContractorRequestById
);

module.exports = router;
