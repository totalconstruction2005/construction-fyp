const Review = require("./review.model");
const validators = require("../../utils/validators");
const { AppError, asyncHandler } = require("../../middleware/errorHandler");

// POST /reviews - Create Review
exports.createReview = asyncHandler(async (req, res) => {
  const { name, rating, review } = req.body;

  const missingFields = validators.validateRequired(req.body, ["name", "rating", "review"]);
  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "MISSING_REQUIRED_FIELDS"
    );
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new AppError("Rating must be a number between 1 and 5", 400, "INVALID_RATING");
  }

  const newReview = await Review.create({
    name: validators.sanitizeString(name),
    rating: numRating,
    review: validators.sanitizeString(review),
    isApproved: false,
    isActive: true,
  });

  return res.status(201).json({
    success: true,
    message: "Review submitted successfully and is pending approval.",
    data: newReview,
  });
});

// GET /reviews - Return approved + active reviews
exports.getApprovedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isApproved: true, isActive: true })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  return res.status(200).json({
    success: true,
    data: reviews,
  });
});

// GET /admin/reviews - Return all reviews
exports.getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  return res.status(200).json({
    success: true,
    data: reviews,
  });
});

// PUT /admin/reviews/:id - Update Review (Approve/Reject, Activate/Deactivate, Edit)
exports.updateReviewAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validators.validateObjectId(id)) {
    throw new AppError("Invalid review ID format", 400, "INVALID_ID_FORMAT");
  }

  const { name, rating, review, isApproved, isActive } = req.body;
  const updateData = {};

  if (name !== undefined) {
    if (!name.trim()) throw new AppError("Name cannot be empty", 400, "INVALID_NAME");
    updateData.name = validators.sanitizeString(name);
  }

  if (rating !== undefined) {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new AppError("Rating must be a number between 1 and 5", 400, "INVALID_RATING");
    }
    updateData.rating = numRating;
  }

  if (review !== undefined) {
    if (!review.trim()) throw new AppError("Review content cannot be empty", 400, "INVALID_REVIEW");
    updateData.review = validators.sanitizeString(review);
  }

  if (isApproved !== undefined) {
    updateData.isApproved = !!isApproved;
  }

  if (isActive !== undefined) {
    updateData.isActive = !!isActive;
  }

  const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedReview) {
    throw new AppError("Review not found", 404, "REVIEW_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: updatedReview,
  });
});

// DELETE /admin/reviews/:id - Delete review
exports.deleteReviewAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validators.validateObjectId(id)) {
    throw new AppError("Invalid review ID format", 400, "INVALID_ID_FORMAT");
  }

  const deletedReview = await Review.findByIdAndDelete(id);

  if (!deletedReview) {
    throw new AppError("Review not found", 404, "REVIEW_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});
