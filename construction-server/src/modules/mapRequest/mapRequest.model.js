const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: { type: String },
    secure_url: { type: String },
    public_id: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const mapRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
      city: { type: String },
    },
    plot: {
      size: { type: Number },
      unit: {
        type: String,
        enum: ["Marla", "Sqft", "Kanal"],
      },
      dimensions: { type: String },
      facing: { type: String },
      type: { type: String },
      cornerPlot: {
        type: String,
        enum: ["Yes", "No"],
      },
    },
    layout: {
      bedrooms: { type: Number },
      washrooms: { type: Number },
      kitchens: { type: Number },
      carPorch: { type: String },
      tvLounge: { type: String },
      drawingRoom: { type: String },
      storeRoom: { type: String },
      lawn: { type: String },
      terrace: { type: String },
    },
    notes: { type: String },
    uploads: [uploadSchema],
    sketchDataUrl: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true, collection: "map_requests" }
);

module.exports = mongoose.model("MapRequest", mapRequestSchema);
