const express = require("express");
const router = express.Router();
const mapRequestController = require("./mapRequest.controller");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const adminOnly = require("../../middleware/adminOnly");

// Protected route with file upload
router.post(
  "/",
  authMiddleware,
  upload.array("uploads", 10),
  mapRequestController.createMapRequest
);

// Protected route to get user's requests
router.get("/my", authMiddleware, mapRequestController.getMyMapRequests);

// Admin routes
router.get("/", authMiddleware, adminOnly, mapRequestController.getAllMapRequests);
router.get("/download", authMiddleware, adminOnly, mapRequestController.downloadMapRequestFile);
router.patch(
  "/:id/status",
  authMiddleware,
  adminOnly,
  mapRequestController.updateMapRequestStatus
);

module.exports = router;
