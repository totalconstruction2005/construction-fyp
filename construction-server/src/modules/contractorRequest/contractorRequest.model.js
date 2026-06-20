const mongoose = require("mongoose");

const planSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    clientName: { type: String, required: true },
    projectTitle: { type: String, required: true },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    phone1: { type: String, required: true },
    phone2: { type: String },
    email: { type: String, required: true },
  },
  { _id: false }
);

const siteSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    plotNumber: { type: String },
    plotSize: { type: String },
  },
  { _id: false }
);

const mapFileSchema = new mongoose.Schema(
  {
    name: { type: String },
    secure_url: { type: String },
    public_id: { type: String },
    resource_type: { type: String },
  },
  { _id: false }
);

const contractorRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractorPlan",
      required: true,
    },
    planSnapshot: { type: planSnapshotSchema, required: true },
    clientName: { type: String, required: true },
    projectTitle: { type: String, required: true },
    contact: { type: contactSchema, required: true },
    site: { type: siteSchema, required: true },
    mapFile: { type: mapFileSchema },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Approved", "Rejected", "In Progress", "Completed"],
      default: "Pending",
      index: true,
    },
    adminNotes: { type: String },
  },
  { timestamps: true, collection: "contractor_requests" }
);

contractorRequestSchema.index({ user: 1 });
contractorRequestSchema.index({ status: 1 });

module.exports = mongoose.model("ContractorRequest", contractorRequestSchema);
