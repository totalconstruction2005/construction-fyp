const mongoose = require("mongoose");
const streamifier = require("streamifier");
const cloudinary = require("../../config/cloudinary");
const ContractorRequest = require("./contractorRequest.model");
const ContractorPlan = require("../contractorPlans/contractorPlan.model");
const ProjectUpdate = require("../projectUpdate/projectUpdate.model");

const sendResponse = (res, status, payload) => res.status(status).json(payload);

const handleError = (res, error, defaultMessage) => {
  console.error("Error occurred:", error.message);

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return sendResponse(res, 400, {
      success: false,
      message: messages.join(", "),
      data: null,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return sendResponse(res, 400, {
      success: false,
      message: `Duplicate value for ${field}`,
      data: null,
    });
  }

  if (error.name === "CastError") {
    return sendResponse(res, 400, {
      success: false,
      message: "Invalid ID format",
      data: null,
    });
  }

  console.error("Unexpected error:", error);
  return sendResponse(res, 500, {
    success: false,
    message: defaultMessage || "Internal server error",
    data: null,
  });
};

const uploadToCloudinary = (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        ...options,
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

exports.createContractorRequest = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return sendResponse(res, 401, {
        success: false,
        message: "Authentication required",
        data: null,
      });
    }

    const {
      planId,
      clientName,
      projectTitle,
      phone1,
      phone2,
      email,
      siteLocation,
      plotNumber,
      plotSize,
    } = req.body;

    if (
      !planId ||
      !clientName ||
      !clientName.trim() ||
      !projectTitle ||
      !projectTitle.trim() ||
      !phone1 ||
      !phone1.trim() ||
      !email ||
      !email.trim() ||
      !siteLocation ||
      !siteLocation.trim()
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "Missing required fields: planId, clientName, projectTitle, phone1, email, siteLocation",
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid plan ID format",
        data: null,
      });
    }

    const plan = await ContractorPlan.findById(planId).lean();
    if (!plan) {
      return sendResponse(res, 404, {
        success: false,
        message: "Contractor plan not found",
        data: null,
      });
    }

    let mapFile;
    if (req.file) {
      const isImage = req.file.mimetype && req.file.mimetype.startsWith("image/");
      const options = isImage ? { resource_type: "image" } : { resource_type: "raw" };

      console.time("Cloudinary Upload");
      try {
        const result = await uploadToCloudinary(req.file.buffer, "contractor_requests/documents", options);
        mapFile = {
          name: req.file.originalname,
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        };
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return sendResponse(res, 500, {
          success: false,
          message: "Failed to upload map file",
          data: null,
        });
      } finally {
        console.timeEnd("Cloudinary Upload");
      }
    }

    const trimmedClientName = clientName.trim();
    const trimmedProjectTitle = projectTitle.trim();

    console.time("DB Save");
    const request = await ContractorRequest.create({
      user: req.user._id,
      plan: plan._id,
      planSnapshot: {
        title: plan.title,
        price: plan.price,
        currency: plan.currency || "PKR",
        clientName: trimmedClientName,
        projectTitle: trimmedProjectTitle,
      },
      clientName: trimmedClientName,
      projectTitle: trimmedProjectTitle,
      contact: {
        phone1: phone1.trim(),
        phone2: phone2 ? phone2.trim() : undefined,
        email: email.trim(),
      },
      site: {
        address: siteLocation.trim(),
        plotNumber: plotNumber ? plotNumber.trim() : undefined,
        plotSize: plotSize ? plotSize.trim() : undefined,
      },
      mapFile,
    });
    console.timeEnd("DB Save");

    return sendResponse(res, 201, {
      success: true,
      message: "Contractor request submitted successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error, "Failed to submit contractor request");
  }
};

// Get all contractor requests for admin (with optional status filter)
exports.getAllContractorRequests = async (req, res) => {
  try {
    const { status } = req.query;

    // Validate status if provided
    const validStatuses = ["Pending", "Contacted", "Approved", "Rejected", "In Progress", "Completed"];
    if (status && !validStatuses.includes(status)) {
      return sendResponse(res, 400, {
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    // Build query
    const query = status ? { status } : {};

    // Fetch contractor requests
    const requests = await ContractorRequest.find(query)
      .populate("user", "name email")
      .populate("plan", "title")
      .sort({ createdAt: -1 })
      .lean();

    return sendResponse(res, 200, {
      success: true,
      message: "Contractor requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch contractor requests");
  }
};

// Update contractor request status
exports.updateContractorRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid request ID format",
        data: null,
      });
    }

    // Validate status
    const validStatuses = ["Pending", "Contacted", "Approved", "Rejected", "In Progress", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return sendResponse(res, 400, {
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    // Find and update
    const request = await ContractorRequest.findById(id);
    if (!request) {
      return sendResponse(res, 404, {
        success: false,
        message: "Contractor request not found",
        data: null,
      });
    }

    request.status = status;
    await request.save();

    // Create system update for status change
    try {
      await ProjectUpdate.create({
        contractorRequest: id,
        title: "Project Status Updated",
        description: `Status changed to "${status}"`,
        createdBy: "system",
      });
    } catch (updateError) {
      console.error("Failed to create system update:", updateError);
      // Don't fail the status update if system update creation fails
    }

    return sendResponse(res, 200, {
      success: true,
      message: "Status updated successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update status");
  }
};

// Get contractor request by ID
exports.getContractorRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid request ID format",
        data: null,
      });
    }

    const request = await ContractorRequest.findById(id)
      .populate("user", "name email")
      .populate("plan", "title")
      .lean();

    if (!request) {
      return sendResponse(res, 404, {
        success: false,
        message: "Contractor request not found",
        data: null,
      });
    }

    // Check authorization: admin can see all, client can only see their own
    if (req.user.role !== "admin" && request.user._id.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, {
        success: false,
        message: "Access denied",
        data: null,
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: "Contractor request fetched successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch contractor request");
  }
};

// Get logged-in client's contractor requests
exports.getMyContractorRequests = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return sendResponse(res, 401, {
        success: false,
        message: "Authentication required",
        data: null,
      });
    }

    const requests = await ContractorRequest.find({ user: req.user._id })
      .populate("plan", "title")
      .sort({ createdAt: -1 })
      .lean();

    return sendResponse(res, 200, {
      success: true,
      message: "Your contractor requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch your contractor requests");
  }
};
