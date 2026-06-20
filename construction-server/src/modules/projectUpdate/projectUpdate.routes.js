const express = require("express");
const router = express.Router();
const projectUpdateController = require("./projectUpdate.controller");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/upload");

// Get all updates for a contractor request
router.get(
  "/:contractorRequestId",
  authMiddleware,
  projectUpdateController.getProjectUpdates
);

// Create a new update
router.post(
  "/:contractorRequestId",
  authMiddleware,
  upload.array("attachments", 5),
  projectUpdateController.createProjectUpdate
);

// Add reply to an update
router.post(
  "/reply/:updateId",
  authMiddleware,
  projectUpdateController.addReply
);

// Delete an update (admin only)
router.delete(
  "/:updateId",
  authMiddleware,
  projectUpdateController.deleteProjectUpdate
);

module.exports = router;
