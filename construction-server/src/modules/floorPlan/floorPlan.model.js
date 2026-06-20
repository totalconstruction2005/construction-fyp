const mongoose = require("mongoose");

/**
 * Helper function to generate URL-friendly slug from string
 */
const toSlug = (value) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

/**
 * FloorPlan Schema
 * 
 * Stores floor plan information with 2D image data from Cloudinary
 */
const floorPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Floor plan title is required"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    marlaSize: {
      type: Number,
      required: [true, "Marla size is required"],
      min: [1, "Marla size must be at least 1"],
      index: true,
    },

    category: {
      type: String,
      enum: {
        values: ["residential", "commercial"],
        message: 'Category must be either "residential" or "commercial"',
      },
      default: "residential",
      index: true,
    },

    rooms: {
      type: Number,
      required: [true, "Number of rooms is required"],
      min: [0, "Rooms cannot be negative"],
    },

    washrooms: {
      type: Number,
      required: [true, "Number of washrooms is required"],
      min: [0, "Washrooms cannot be negative"],
    },

    image: {
      name: {
        type: String,
        required: [true, "Image name is required"],
        trim: true,
      },
      secure_url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      public_id: {
        type: String,
        required: [true, "Cloudinary public ID is required"],
      },
      resource_type: {
        type: String,
        required: [true, "Resource type is required"],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "floor_plans",
  }
);

/**
 * Compound index for efficient querying
 */
floorPlanSchema.index({ marlaSize: 1, category: 1, isActive: 1 });

/**
 * Pre-validation middleware to generate unique slug from title
 * Ensures slug is always unique by appending counter if needed
 */
floorPlanSchema.pre("validate", async function () {
  // Only generate slug if new document or title has been modified
  if (this.isNew || this.isModified("title")) {
    if (!this.title) {
      return; // Let validation handle missing title
    }

    const FloorPlan = mongoose.model("FloorPlan");
    const baseSlug = toSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing documents with same slug (excluding current document)
    while (await FloorPlan.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

/**
 * Export FloorPlan model
 */
module.exports = mongoose.model("FloorPlan", floorPlanSchema);
