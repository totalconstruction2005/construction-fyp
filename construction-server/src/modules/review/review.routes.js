const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const authMiddleware = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");

// Public endpoints
router.post("/", reviewController.createReview);
router.get("/", reviewController.getApprovedReviews);

// Admin endpoints (since app.js mounts this router on /api/reviews, these become /api/reviews/admin and /api/reviews/admin/:id)
router.get("/admin", authMiddleware, adminOnly, reviewController.getAllReviewsAdmin);
router.put("/admin/:id", authMiddleware, adminOnly, reviewController.updateReviewAdmin);
router.delete("/admin/:id", authMiddleware, adminOnly, reviewController.deleteReviewAdmin);

module.exports = router;
