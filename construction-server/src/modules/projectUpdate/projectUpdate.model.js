const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
    resource_type: { type: String, required: true },
  },
  { _id: false }
);

const replySchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    createdBy: {
      type: String,
      enum: ["admin", "client"],
      required: true,
    },
    parentReplyId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const projectUpdateSchema = new mongoose.Schema(
  {
    contractorRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractorRequest",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      type: String,
      enum: ["admin", "client", "system"],
      required: true,
    },
    attachments: [attachmentSchema],
    replies: [replySchema],
  },
  {
    timestamps: true,
    collection: "project_updates",
  }
);

// Compound index for efficient querying
projectUpdateSchema.index({ contractorRequest: 1, createdAt: -1 });

module.exports = mongoose.model("ProjectUpdate", projectUpdateSchema);
