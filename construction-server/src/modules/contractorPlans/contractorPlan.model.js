const mongoose = require("mongoose");

const toSlug = (value) => {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const contractorPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Top Label
    badge: {
      type: String,
      default: "",
      trim: true,
    },

    // Example: Foundation to Roof Slab
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    // Price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "Rs.",
    },

    // Example: per sq ft
    priceUnit: {
      type: String,
      default: "per sq ft",
    },

    // Estimate Text
    estimateText: {
      type: String,
      default: "",
      trim: true,
    },

    // Description paragraph
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // What's Included
    includedFeatures: {
      type: [String],
      default: [],
    },

    // Not Included
    excludedFeatures: {
      type: [String],
      default: [],
    },

    // Example: 4-6 Months
    timeline: {
      type: String,
      default: "",
      trim: true,
    },

    // Example: Ideal for families...
    idealFor: {
      type: String,
      default: "",
      trim: true,
    },

    // Button Text
    buttonText: {
      type: String,
      default: "Select Package",
    },

    // Recommended Package
    recommended: {
      type: Boolean,
      default: false,
    },

    // Card Theme
    theme: {
      type: String,
      enum: ["green", "dark", "gold", "gray"],
      default: "green",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contractorPlanSchema.pre("validate", async function () {

  // Auto Sort Order
  if (this.isNew) {
    const lastPlan = await this.constructor
      .findOne({})
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();

    this.sortOrder = lastPlan
      ? lastPlan.sortOrder + 1
      : 0;
  }

  // Generate Slug
  if (this.isNew || this.isModified("title")) {

    if (!this.title) return;

    const ContractorPlan = mongoose.model("ContractorPlan");

    const baseSlug = toSlug(this.title);

    let slug = baseSlug;

    let counter = 1;

    while (
      await ContractorPlan.exists({
        slug,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

contractorPlanSchema.index({
  sortOrder: 1,
});

module.exports = mongoose.model(
  "ContractorPlan",
  contractorPlanSchema
);