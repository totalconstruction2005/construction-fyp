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
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "PKR",
    },
    tagline: {
      type: String,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
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
  { timestamps: true }
);

contractorPlanSchema.pre("validate", async function () {
  // Auto-assign sortOrder for new documents
  if (this.isNew) {
    const lastPlan = await this.constructor
      .findOne({})
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();

    this.sortOrder = lastPlan ? lastPlan.sortOrder + 1 : 0;
  }

  // Generate unique slug from title
  if (this.isNew || this.isModified("title")) {
    if (!this.title) {
      return; // Let validation handle missing title
    }

    const ContractorPlan = mongoose.model("ContractorPlan");
    const baseSlug = toSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing documents with same slug (excluding current document)
    while (await ContractorPlan.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

contractorPlanSchema.index({ sortOrder: 1 });

module.exports = mongoose.model("ContractorPlan", contractorPlanSchema);
