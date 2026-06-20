const mongoose = require("mongoose");
const FloorPlan = require("./floorPlan.model");
const cloudinary = require("../../config/cloudinary");

/**
 * Upload image to Cloudinary
 */
const uploadToCloudinary = async (file, folder) => {
  try {
    // Validate file
    if (!file || !file.buffer) {
      throw new Error("Invalid file: No file buffer provided");
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed");
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ],
        },
        (error, result) => {
          if (error) {
            console.error("☁️  Cloudinary upload error:", error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error("☁️  Upload validation error:", error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.warn("⚠️  No public_id provided for deletion");
      return { success: false, message: "No public_id provided" };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === "ok") {
      console.log("✅ Successfully deleted from Cloudinary:", publicId);
      return { success: true, result };
    } else if (result.result === "not found") {
      console.warn("⚠️  Image not found in Cloudinary:", publicId);
      return { success: false, message: "Image not found", result };
    } else {
      console.warn("⚠️  Unexpected Cloudinary deletion result:", result);
      return { success: false, message: "Unexpected result", result };
    }
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * GET /api/admin/floor-plans
 * Get all floor plans (active + inactive)
 */
exports.getAllFloorPlans = async (req, res) => {
  try {
    const floorPlans = await FloorPlan.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Floor plans retrieved successfully",
      data: floorPlans,
    });
  } catch (error) {
    console.error("Error fetching floor plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve floor plans",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/floor-plans/:id
 * Get single floor plan by ID
 */
exports.getFloorPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor plan ID",
      });
    }

    const floorPlan = await FloorPlan.findById(id);

    if (!floorPlan) {
      return res.status(404).json({
        success: false,
        message: "Floor plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Floor plan retrieved successfully",
      data: floorPlan,
    });
  } catch (error) {
    console.error("Error fetching floor plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve floor plan",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/floor-plans
 * Create new floor plan with image upload
 */
exports.createFloorPlan = async (req, res) => {
  let uploadedImagePublicId = null;

  try {
    console.log("📝 Create Floor Plan Request:");
    console.log("Body:", req.body);
    console.log("File:", req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : "No file");
    
    const { title, marlaSize, category, rooms, washrooms, isActive } = req.body;

    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty",
      });
    }

    if (!marlaSize || !rooms || !washrooms) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: marlaSize, rooms, washrooms",
      });
    }

    // Validate numeric fields
    const marla = Number(marlaSize);
    const roomCount = Number(rooms);
    const washroomCount = Number(washrooms);

    if (isNaN(marla) || marla <= 0) {
      return res.status(400).json({
        success: false,
        message: "Marla size must be a positive number",
      });
    }

    if (isNaN(roomCount) || roomCount < 0 || !Number.isInteger(roomCount)) {
      return res.status(400).json({
        success: false,
        message: "Rooms must be a non-negative integer",
      });
    }

    if (isNaN(washroomCount) || washroomCount < 0 || !Number.isInteger(washroomCount)) {
      return res.status(400).json({
        success: false,
        message: "Washrooms must be a non-negative integer",
      });
    }

    // Validate image upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // Upload image to Cloudinary
    console.log("☁️  Uploading to Cloudinary...");
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        req.file,
        "floor_plans/images"
      );
      uploadedImagePublicId = uploadResult.public_id;
      console.log("✅ Cloudinary upload successful:", uploadResult.public_id);
    } catch (uploadError) {
      console.error("❌ Cloudinary upload failed:", uploadError.message);
      return res.status(400).json({
        success: false,
        message: uploadError.message || "Failed to upload image",
      });
    }

    // Create floor plan document
    let floorPlan;
    try {
      floorPlan = await FloorPlan.create({
        title: title.trim(),
        marlaSize: marla,
        category: category?.trim() || "residential",
        rooms: roomCount,
        washrooms: washroomCount,
        image: {
          name: req.file.originalname,
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
        },
        isActive: isActive === "true" || isActive === true,
      });

      console.log("✅ Floor plan created:", floorPlan._id);

      res.status(201).json({
        success: true,
        message: "Floor plan created successfully",
        data: floorPlan,
      });
    } catch (dbError) {
      // Rollback: Delete uploaded image if database creation fails
      console.log("🔄 Rolling back: Deleting uploaded image from Cloudinary...");
      await deleteFromCloudinary(uploadedImagePublicId);
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("❌ Error creating floor plan:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
    });

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle duplicate key error (unique slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A floor plan with a similar title already exists",
      });
    }

    // Handle mongoose cast errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data type provided",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create floor plan",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

/**
 * PUT /api/admin/floor-plans/:id
 * Update floor plan (with optional image update)
 */
exports.updateFloorPlan = async (req, res) => {
  let newImagePublicId = null;
  let oldImagePublicId = null;

  try {
    console.log("✏️  Update Floor Plan Request:");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);
    console.log("File:", req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : "No new file");
    
    const { id } = req.params;
    const { title, marlaSize, category, rooms, washrooms, isActive } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor plan ID format",
      });
    }

    // Find existing floor plan
    const floorPlan = await FloorPlan.findById(id);

    if (!floorPlan) {
      return res.status(404).json({
        success: false,
        message: "Floor plan not found",
      });
    }

    console.log("📋 Existing floor plan found:", floorPlan.title);

    // Prepare update data with validation
    const updateData = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      updateData.title = title.trim();
    }

    if (marlaSize !== undefined) {
      const marla = Number(marlaSize);
      if (isNaN(marla) || marla <= 0) {
        return res.status(400).json({
          success: false,
          message: "Marla size must be a positive number",
        });
      }
      updateData.marlaSize = marla;
    }

    if (category !== undefined) {
      updateData.category = category.trim() || "residential";
    }

    if (rooms !== undefined) {
      const roomCount = Number(rooms);
      if (isNaN(roomCount) || roomCount < 0 || !Number.isInteger(roomCount)) {
        return res.status(400).json({
          success: false,
          message: "Rooms must be a non-negative integer",
        });
      }
      updateData.rooms = roomCount;
    }

    if (washrooms !== undefined) {
      const washroomCount = Number(washrooms);
      if (isNaN(washroomCount) || washroomCount < 0 || !Number.isInteger(washroomCount)) {
        return res.status(400).json({
          success: false,
          message: "Washrooms must be a non-negative integer",
        });
      }
      updateData.washrooms = washroomCount;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true" || isActive === true;
    }

    // Handle image update if new image provided
    if (req.file) {
      console.log("🖼️  New image provided, replacing old image...");
      
      // Store old image ID for potential rollback
      oldImagePublicId = floorPlan.image?.public_id;

      // Upload new image first
      console.log("☁️  Uploading new image to Cloudinary...");
      let uploadResult;
      try {
        uploadResult = await uploadToCloudinary(
          req.file,
          "floor_plans/images"
        );
        newImagePublicId = uploadResult.public_id;
        console.log("✅ New image uploaded:", uploadResult.public_id);
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError.message);
        return res.status(400).json({
          success: false,
          message: uploadError.message || "Failed to upload new image",
        });
      }

      updateData.image = {
        name: req.file.originalname,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type,
      };
    }

    // Update floor plan in database
    let updatedFloorPlan;
    try {
      updatedFloorPlan = await FloorPlan.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (dbError) {
      // Rollback: If DB update fails and we uploaded a new image, delete it
      if (newImagePublicId) {
        console.log("🔄 Rolling back: Deleting newly uploaded image...");
        await deleteFromCloudinary(newImagePublicId);
      }
      throw dbError; // Re-throw to be caught by outer catch
    }

    // Only delete old image after successful database update
    if (req.file && oldImagePublicId) {
      console.log("🗑️  Deleting old image from Cloudinary:", oldImagePublicId);
      await deleteFromCloudinary(oldImagePublicId);
    }

    console.log("✅ Floor plan updated successfully:", updatedFloorPlan._id);

    res.status(200).json({
      success: true,
      message: "Floor plan updated successfully",
      data: updatedFloorPlan,
    });
  } catch (error) {
    console.error("❌ Error updating floor plan:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
    });

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A floor plan with a similar title already exists",
      });
    }

    // Handle mongoose cast errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data type provided",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update floor plan",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

/**
 * DELETE /api/admin/floor-plans/:id
 * Delete floor plan and its image
 */
exports.deleteFloorPlan = async (req, res) => {
  try {
    console.log("🗑️  Delete Floor Plan Request:");
    console.log("ID:", req.params.id);
    
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor plan ID format",
      });
    }

    // Find floor plan
    const floorPlan = await FloorPlan.findById(id);

    if (!floorPlan) {
      return res.status(404).json({
        success: false,
        message: "Floor plan not found",
      });
    }

    console.log("📋 Floor plan found:", floorPlan.title);

    // Store image public_id before deletion
    const imagePublicId = floorPlan.image?.public_id;

    // Delete floor plan document first
    await FloorPlan.findByIdAndDelete(id);
    console.log("✅ Floor plan document deleted from database");

    // Delete image from Cloudinary (non-blocking, best effort)
    if (imagePublicId) {
      console.log("☁️  Deleting image from Cloudinary:", imagePublicId);
      const deleteResult = await deleteFromCloudinary(imagePublicId);
      
      if (deleteResult.success) {
        console.log("✅ Image deleted from Cloudinary successfully");
      } else {
        console.warn("⚠️  Image deletion from Cloudinary failed, but floor plan removed from database");
        // Note: We still return success because the main operation (DB deletion) succeeded
      }
    } else {
      console.log("ℹ️  No image to delete from Cloudinary");
    }

    console.log("✅ Floor plan deleted successfully");

    res.status(200).json({
      success: true,
      message: "Floor plan deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting floor plan:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
    });

    // Handle mongoose cast errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid floor plan ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete floor plan",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// PUBLIC API - Get all active floor plans (no auth required)
exports.getPublicFloorPlans = async (req, res) => {
  try {
    console.log("🔍 [PUBLIC API] Fetching public active floor plans...");
    console.log("📍 Request path:", req.path);
    console.log("📍 Request method:", req.method);
    
    // Count all floor plans
    const totalCount = await FloorPlan.countDocuments({});
    console.log(`📊 Total floor plans in database: ${totalCount}`);
    
    // Count active floor plans
    const activeCount = await FloorPlan.countDocuments({ isActive: true });
    console.log(`📊 Active floor plans: ${activeCount}`);
    
    // If no active plans, count inactive plans
    if (activeCount === 0) {
      const inactiveCount = await FloorPlan.countDocuments({ isActive: false });
      console.warn(`⚠️  No active plans! Inactive plans: ${inactiveCount}`);
    }
    
    const floorPlans = await FloorPlan.find({ isActive: true })
      .select("_id title slug marlaSize category rooms washrooms image createdAt")
      .lean()
      .exec();

    console.log(`✅ [PUBLIC API] Retrieved ${floorPlans.length} active floor plans`);
    if (floorPlans.length > 0) {
      console.log("📦 First result sample:", JSON.stringify(floorPlans[0], null, 2));
    }

    res.status(200).json({
      success: true,
      message: "Floor plans retrieved successfully",
      count: floorPlans.length,
      debug: {
        totalInDatabase: totalCount,
        activeInDatabase: activeCount,
      },
      data: floorPlans,
    });
  } catch (error) {
    console.error("❌ [PUBLIC API] Error fetching public floor plans:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve floor plans",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// DEVELOPMENT ONLY - Create sample floor plans
exports.seedSampleFloorPlans = async (req, res) => {
  try {
    console.log("🌱 Seeding sample floor plans...");
    
    // Check if floor plans already exist
    const existingCount = await FloorPlan.countDocuments({});
    
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Database already has ${existingCount} floor plans. Skipping seed.`,
      });
    }
    
    const samplePlans = [
      {
        title: "3 Marla Modern Layout",
        marlaSize: 3,
        category: "residential",
        rooms: 3,
        washrooms: 2,
        image: {
          name: "sample-3marla.jpg",
          secure_url: "https://via.placeholder.com/400x300?text=3+Marla",
          public_id: "floor_plans/sample/3marla",
          resource_type: "image",
        },
        isActive: true,
      },
      {
        title: "5 Marla Family Home",
        marlaSize: 5,
        category: "residential",
        rooms: 4,
        washrooms: 3,
        image: {
          name: "sample-5marla.jpg",
          secure_url: "https://via.placeholder.com/400x300?text=5+Marla",
          public_id: "floor_plans/sample/5marla",
          resource_type: "image",
        },
        isActive: true,
      },
      {
        title: "2 Marla Compact",
        marlaSize: 2,
        category: "residential",
        rooms: 2,
        washrooms: 1,
        image: {
          name: "sample-2marla.jpg",
          secure_url: "https://via.placeholder.com/400x300?text=2+Marla",
          public_id: "floor_plans/sample/2marla",
          resource_type: "image",
        },
        isActive: true,
      },
      {
        title: "10 Marla Luxury",
        marlaSize: 10,
        category: "residential",
        rooms: 5,
        washrooms: 4,
        image: {
          name: "sample-10marla.jpg",
          secure_url: "https://via.placeholder.com/400x300?text=10+Marla",
          public_id: "floor_plans/sample/10marla",
          resource_type: "image",
        },
        isActive: true,
      },
    ];
    
    const created = await FloorPlan.insertMany(samplePlans);
    console.log(`✅ Created ${created.length} sample floor plans`);
    
    res.status(201).json({
      success: true,
      message: `Created ${created.length} sample floor plans`,
      data: created,
    });
  } catch (error) {
    console.error("❌ Error seeding floor plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed floor plans",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};
