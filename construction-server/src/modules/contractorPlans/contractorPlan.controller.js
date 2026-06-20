const mongoose = require("mongoose");
const ContractorPlan = require("./contractorPlan.model");

const toSlug = (value) => {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const sendResponse = (res, status, payload) => res.status(status).json(payload);

const handleError = (res, error, defaultMessage) => {
  console.error("Error occurred:", error.message);
  
  // Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map(err => err.message);
    return sendResponse(res, 400, {
      success: false,
      message: messages.join(", "),
      data: null,
    });
  }

  // Duplicate key error (unique constraint)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return sendResponse(res, 400, {
      success: false,
      message: `A plan with this ${field} already exists`,
      data: null,
    });
  }

  // Invalid ObjectId format
  if (error.name === "CastError") {
    return sendResponse(res, 400, {
      success: false,
      message: "Invalid ID format",
      data: null,
    });
  }

  // Default server error
  console.error("Unexpected error:", error);
  return sendResponse(res, 500, {
    success: false,
    message: defaultMessage || "Internal server error",
    data: null,
  });
};

exports.createPlan = async (req, res) => {
  try {
    const { title, price, currency, tagline, features, isActive } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: "Title is required",
        data: null,
      });
    }

    if (price === undefined || price === null || price < 0) {
      return sendResponse(res, 400, {
        success: false,
        message: "Valid price is required (must be 0 or greater)",
        data: null,
      });
    }

    // Validate features array if provided
    if (features && !Array.isArray(features)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Features must be an array",
        data: null,
      });
    }

    // Create plan
    const plan = await ContractorPlan.create({
      title: title.trim(),
      price,
      currency: currency || "PKR",
      tagline: tagline?.trim() || "",
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return sendResponse(res, 201, {
      success: true,
      message: "Contractor plan created successfully",
      data: plan,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create contractor plan");
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    // Admin users can see all plans (active and inactive)
    // Regular users and unauthenticated users only see active plans
    const isAdmin = req.user && req.user.role === "admin";
    const filter = isAdmin ? {} : { isActive: true };

    const plans = await ContractorPlan.find(filter)
      .sort({ sortOrder: 1 })
      .lean();

    return sendResponse(res, 200, {
      success: true,
      message: "Contractor plans fetched successfully",
      data: plans,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch contractor plans");
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid plan ID format",
        data: null,
      });
    }

    const updateData = { ...req.body };

    // Validate price if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      return sendResponse(res, 400, {
        success: false,
        message: "Price must be 0 or greater",
        data: null,
      });
    }

    // Validate title if provided
    if (updateData.title !== undefined && !updateData.title.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: "Title cannot be empty",
        data: null,
      });
    }

    // Validate features if provided
    if (updateData.features !== undefined && !Array.isArray(updateData.features)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Features must be an array",
        data: null,
      });
    }

    // Trim title and tagline
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.tagline) updateData.tagline = updateData.tagline.trim();

    // Check for duplicate title/slug
    if (updateData.title) {
      updateData.slug = toSlug(updateData.title);

      const existingPlan = await ContractorPlan.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      }).lean();

      if (existingPlan) {
        return sendResponse(res, 400, {
          success: false,
          message: "A plan with this title already exists",
          data: null,
        });
      }
    }

    // Update plan
    const updatedPlan = await ContractorPlan.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updatedPlan) {
      return sendResponse(res, 404, {
        success: false,
        message: "Contractor plan not found",
        data: null,
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: "Contractor plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update contractor plan");
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid plan ID format",
        data: null,
      });
    }

    const deletedPlan = await ContractorPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return sendResponse(res, 404, {
        success: false,
        message: "Contractor plan not found",
        data: null,
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: "Contractor plan deleted successfully",
      data: null,
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete contractor plan");
  }
};

exports.reorderPlans = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    // Validate orderedIds
    if (!Array.isArray(orderedIds)) {
      return sendResponse(res, 400, {
        success: false,
        message: "orderedIds must be an array",
        data: null,
      });
    }

    if (orderedIds.length === 0) {
      return sendResponse(res, 400, {
        success: false,
        message: "orderedIds cannot be empty",
        data: null,
      });
    }

    // Validate all IDs are valid ObjectIds
    const invalidIds = orderedIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid plan IDs found in orderedIds",
        data: null,
      });
    }

    // Build bulk operations
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { sortOrder: index },
      },
    }));

    // Execute bulk update
    const result = await ContractorPlan.bulkWrite(bulkOps);

    // Check if any plans were actually updated
    if (result.modifiedCount === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: "No plans were updated. Check if the provided IDs exist.",
        data: null,
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: `Successfully reordered ${result.modifiedCount} plan(s)`,
      data: null,
    });
  } catch (error) {
    return handleError(res, error, "Failed to reorder contractor plans");
  }
};
