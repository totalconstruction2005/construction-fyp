const MapRequest = require("./mapRequest.model");
const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");
const https = require("https");
const path = require("path");

/**
 * Upload buffer to Cloudinary
 */
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

/**
 * @desc    Create a new map request
 * @route   POST /api/map-requests
 * @access  Protected (JWT required)
 */
exports.createMapRequest = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      city,
      plotSize,
      plotUnit,
      dimensions,
      facing,
      plotType,
      cornerPlot,
      bedrooms,
      washrooms,
      kitchens,
      carPorch,
      tvLounge,
      drawingRoom,
      storeRoom,
      lawn,
      terrace,
      notes,
      sketchDataUrl,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !plotSize || !plotUnit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, phone, plotSize, and plotUnit are required",
      });
    }

    // Upload files to Cloudinary
    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        const isImage = file.mimetype && file.mimetype.startsWith("image/");
        const options = isImage
          ? {
              resource_type: "image",
              transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
            }
          : { resource_type: "raw" };

        return uploadToCloudinary(file.buffer, "map_requests/documents", options);
      });

      const results = await Promise.all(uploadPromises);

      uploadedFiles = results.map((result, index) => ({
        name: req.files[index].originalname,
        type: req.files[index].mimetype,
        resource_type: result.resource_type,
        secure_url: result.secure_url,
        public_id: result.public_id,
        url: result.secure_url,
      }));
    }

    // Upload sketch if exists
    let sketchUrl = null;

    if (sketchDataUrl) {
      const result = await cloudinary.uploader.upload(sketchDataUrl, {
        folder: "map_requests/sketches",
        resource_type: "image",
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      });

      sketchUrl = result.secure_url;
    }

    const toYesNo = (value) => {
      if (value === true || value === "true") return "Yes";
      if (value === false || value === "false") return "No";
      return value;
    };

    // Convert to grouped structure
    const mapRequestData = {
      user: req.user.id,
      contact: {
        name,
        phone,
        email,
        city,
      },
      plot: {
        size: Number(plotSize),
        unit: plotUnit,
        dimensions,
        facing,
        type: plotType,
        cornerPlot: toYesNo(cornerPlot),
      },
      layout: {
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        washrooms: washrooms ? Number(washrooms) : undefined,
        kitchens: kitchens ? Number(kitchens) : undefined,
        carPorch: toYesNo(carPorch),
        tvLounge: toYesNo(tvLounge),
        drawingRoom: toYesNo(drawingRoom),
        storeRoom: toYesNo(storeRoom),
        lawn: toYesNo(lawn),
        terrace: toYesNo(terrace),
      },
      notes,
      uploads: uploadedFiles,
      sketchDataUrl: sketchUrl,
    };

    const mapRequest = await MapRequest.create(mapRequestData);

    res.status(201).json({
      success: true,
      message: "Map request created successfully",
      data: mapRequest,
    });
  } catch (error) {
    console.error("Map request creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create map request",
    });
  }
};

/**
 * @desc    Get logged-in user's map requests
 * @route   GET /api/map-requests/my
 * @access  Protected (JWT required)
 */
exports.getMyMapRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const mapRequests = await MapRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const data = mapRequests.map((request) => {
      const uploads = (request.uploads || []).map((upload) => ({
        ...upload,
        secure_url: upload.secure_url || upload.url,
        public_id: upload.public_id || null,
      }));

      return {
        ...request,
        uploads,
        sketch: request.sketchDataUrl ? { secure_url: request.sketchDataUrl } : null,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get my map requests error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch map requests",
    });
  }
};

/**
 * @desc    Get all map requests (admin)
 * @route   GET /api/map-requests
 * @access  Protected (Admin only)
 */
exports.getAllMapRequests = async (req, res) => {
  try {
    const mapRequests = await MapRequest.find()
      .populate("user", "name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const data = mapRequests.map((request) => {
      const uploads = (request.uploads || []).map((upload) => ({
        ...upload,
        secure_url: upload.secure_url || upload.url,
        public_id: upload.public_id || null,
      }));

      return {
        ...request,
        uploads,
        sketch: request.sketchDataUrl ? { secure_url: request.sketchDataUrl } : null,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get all map requests error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch map requests",
    });
  }
};

/**
 * @desc    Update map request status (admin)
 * @route   PATCH /api/map-requests/:id/status
 * @access  Protected (Admin only)
 */
exports.updateMapRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Contacted", "In Progress", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const mapRequest = await MapRequest.findById(req.params.id);
    if (!mapRequest) {
      return res.status(404).json({
        success: false,
        message: "Map request not found",
      });
    }

    mapRequest.status = status;
    await mapRequest.save();

    const updatedRequest = await MapRequest.findById(req.params.id)
      .populate("user", "name email createdAt")
      .lean();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update map request status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

/**
 * @desc    Download a map request file (admin)
 * @route   GET /api/map-requests/download
 * @access  Protected (Admin only)
 */
exports.downloadMapRequestFile = async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "File URL is required",
      });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid file URL",
      });
    }

    if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith("res.cloudinary.com")) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file host",
      });
    }

    const fallbackName = path.basename(parsedUrl.pathname) || "download";
    const safeName = path.basename((filename || fallbackName).toString()).replace(/\s+/g, "_");

    const streamFile = (fileUrl, redirectCount = 0) => {
      https.get(fileUrl, (fileResponse) => {
        const statusCode = fileResponse.statusCode || 0;

        if (statusCode >= 300 && statusCode < 400 && fileResponse.headers.location) {
          if (redirectCount >= 5) {
            return res.status(502).json({
              success: false,
              message: "Too many redirects while downloading file",
            });
          }

          const nextUrl = new URL(fileResponse.headers.location, fileUrl).toString();
          fileResponse.resume();
          return streamFile(nextUrl, redirectCount + 1);
        }

        if (statusCode >= 400) {
          return res.status(502).json({
            success: false,
            message: "Failed to download file from storage",
          });
        }

        res.setHeader(
          "Content-Type",
          fileResponse.headers["content-type"] || "application/octet-stream"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);

        fileResponse.pipe(res);
      }).on("error", (error) => {
        console.error("File download error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to download file",
        });
      });
    };

    streamFile(parsedUrl.toString());
  } catch (error) {
    console.error("Download map request file error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to download file",
    });
  }
};
