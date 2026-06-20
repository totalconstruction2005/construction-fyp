const mongoose = require("mongoose");
const streamifier = require("streamifier");
const cloudinary = require("../../config/cloudinary");
const ProjectUpdate = require("./projectUpdate.model");
const ContractorRequest = require("../contractorRequest/contractorRequest.model");

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

// Get all updates for a contractor request
exports.getProjectUpdates = async (req, res) => {
  try {
    // PART 1: Safe Authorization Guard
    if (!req.user || !req.user._id || !req.user.role) {
      return sendResponse(res, 401, {
        success: false,
        message: "Authentication required. Please log in to access this resource.",
        data: null,
      });
    }

    const { contractorRequestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contractorRequestId)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid contractor request ID format. Please provide a valid ID.",
        data: null,
      });
    }

    // Check if contractor request exists
    const contractorRequest = await ContractorRequest.findById(contractorRequestId);
    if (!contractorRequest) {
      return sendResponse(res, 404, {
        success: false,
        message: "Project not found. The requested contractor request does not exist.",
        data: null,
      });
    }

    // Check authorization: admin can see all, client can only see their own
    if (req.user.role !== "admin" && contractorRequest.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, {
        success: false,
        message: "Access denied. You do not have permission to view this project's updates.",
        data: null,
      });
    }

    // PART 6: Performance Improvement - Fetch updates with optimized query
    const updates = await ProjectUpdate.find({ contractorRequest: contractorRequestId })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return sendResponse(res, 200, {
      success: true,
      message: "Project updates fetched successfully",
      data: updates,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch project updates. Please try again later.");
  }
};

// Create a new project update
exports.createProjectUpdate = async (req, res) => {
  try {
    // PART 1: Safe Authorization Guard
    if (!req.user || !req.user._id || !req.user.role) {
      return sendResponse(res, 401, {
        success: false,
        message: "Authentication required. Please log in to create updates.",
        data: null,
      });
    }

    const { contractorRequestId } = req.params;
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contractorRequestId)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid contractor request ID format. Please provide a valid ID.",
        data: null,
      });
    }

    if (!title || !title.trim() || !description || !description.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: "Title and description are required fields and cannot be empty.",
        data: null,
      });
    }

    // Check if contractor request exists
    const contractorRequest = await ContractorRequest.findById(contractorRequestId);
    if (!contractorRequest) {
      return sendResponse(res, 404, {
        success: false,
        message: "Project not found. The requested contractor request does not exist.",
        data: null,
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && contractorRequest.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, {
        success: false,
        message: "Access denied. You do not have permission to create updates for this project.",
        data: null,
      });
    }

    // PART 2: Restrict client updates by project status
    const allowedStatuses = ["Approved", "In Progress", "Completed"];
    if (req.user.role !== "admin" && !allowedStatuses.includes(contractorRequest.status)) {
      return sendResponse(res, 403, {
        success: false,
        message: `You can only create updates for projects with status: ${allowedStatuses.join(", ")}. Current status is "${contractorRequest.status}".`,
        data: null,
      });
    }

    // PART 3: Strict Cloudinary Upload - Upload attachments (fail fast)
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isImage = file.mimetype && file.mimetype.startsWith("image/");
        const options = isImage ? { resource_type: "image" } : { resource_type: "raw" };

        try {
          const result = await uploadToCloudinary(file.buffer, "project_updates/attachments", options);
          attachments.push({
            name: file.originalname,
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          // FAIL FAST: If any upload fails, don't create the update
          return sendResponse(res, 500, {
            success: false,
            message: `Failed to upload attachment "${file.originalname}". Please check the file and try again.`,
            data: null,
          });
        }
      }
    }

    // Determine createdBy based on user role
    const createdBy = req.user.role === "admin" ? "admin" : "client";

    // Create update
    const update = await ProjectUpdate.create({
      contractorRequest: contractorRequestId,
      title: title.trim(),
      description: description.trim(),
      createdBy,
      attachments,
    });

    return sendResponse(res, 201, {
      success: true,
      message: "Project update created successfully",
      data: update,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create project update. Please try again later.");
  }
};

// Add a reply to an update
exports.addReply = async (req, res) => {
  try {
    // PART 1: Safe Authorization Guard
    if (!req.user || !req.user._id || !req.user.role) {
      return sendResponse(res, 401, {
        success: false,
        message: "Authentication required. Please log in to add replies.",
        data: null,
      });
    }

    const { updateId } = req.params;
    const { message, parentReplyId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(updateId)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid update ID format. Please provide a valid ID.",
        data: null,
      });
    }

    if (!message || !message.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: "Message is required and cannot be empty.",
        data: null,
      });
    }

    // Find update
    const update = await ProjectUpdate.findById(updateId);
    if (!update) {
      return sendResponse(res, 404, {
        success: false,
        message: "Update not found. The requested project update does not exist.",
        data: null,
      });
    }

    // Check authorization
    const contractorRequest = await ContractorRequest.findById(update.contractorRequest);
    if (!contractorRequest) {
      return sendResponse(res, 404, {
        success: false,
        message: "Project not found. The associated contractor request does not exist.",
        data: null,
      });
    }

    if (req.user.role !== "admin" && contractorRequest.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, {
        success: false,
        message: "Access denied. You do not have permission to reply to this update.",
        data: null,
      });
    }

    // Validate parentReplyId if provided
    if (parentReplyId) {
      if (!mongoose.Types.ObjectId.isValid(parentReplyId)) {
        return sendResponse(res, 400, {
          success: false,
          message: "Invalid parent reply ID format. Please provide a valid ID.",
          data: null,
        });
      }

      const parentReply = update.replies.id(parentReplyId);
      if (!parentReply) {
        return sendResponse(res, 404, {
          success: false,
          message: "Parent reply not found. The reply you're trying to respond to does not exist.",
          data: null,
        });
      }
    }

    // Add reply
    const createdBy = req.user.role === "admin" ? "admin" : "client";
    const reply = {
      message: message.trim(),
      createdBy,
      parentReplyId: parentReplyId || undefined,
    };

    update.replies.push(reply);
    await update.save();

    // PART 4: Return only the newly created reply (optimization)
    const newReply = update.replies[update.replies.length - 1];

    return sendResponse(res, 200, {
      success: true,
      message: "Reply added successfully",
      data: newReply,
    });
  } catch (error) {
    return handleError(res, error, "Failed to add reply. Please try again later.");
  }
};

// Delete an update (admin only)
exports.deleteProjectUpdate = async (req, res) => {
  try {
    // PART 1: Safe Authorization Guard
    if (!req.user || !req.user._id || !req.user.role) {
      return sendResponse(res, 401, {
        success: false,
        message: "Authentication required. Please log in to delete updates.",
        data: null,
      });
    }

    const { updateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(updateId)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid update ID format. Please provide a valid ID.",
        data: null,
      });
    }

    if (req.user.role !== "admin") {
      return sendResponse(res, 403, {
        success: false,
        message: "Admin access required. Only administrators can delete updates.",
        data: null,
      });
    }

    // PART 5: Safer deletion order - Find update first
    const update = await ProjectUpdate.findById(updateId);
    if (!update) {
      return sendResponse(res, 404, {
        success: false,
        message: "Update not found. The requested project update does not exist.",
        data: null,
      });
    }

    // PART 5: Delete Cloudinary attachments FIRST (before DB)
    if (update.attachments && update.attachments.length > 0) {
      for (const attachment of update.attachments) {
        try {
          await cloudinary.uploader.destroy(attachment.public_id, {
            resource_type: attachment.resource_type,
          });
        } catch (err) {
          // Log error but continue with deletion process
          console.error(`Failed to delete attachment ${attachment.public_id} from Cloudinary:`, err);
        }
      }
    }

    // Delete from database after Cloudinary cleanup
    await ProjectUpdate.findByIdAndDelete(updateId);

    return sendResponse(res, 200, {
      success: true,
      message: "Update deleted successfully",
      data: null,
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete update. Please try again later.");
  }
};
