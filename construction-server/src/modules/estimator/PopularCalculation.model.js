const mongoose = require("mongoose");

const PopularCalculationSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
    },

    area: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      default: "Marla",
    },

    coveredArea: {
      type: Number,
      required: true,
    },

    constructionType: {
      type: String,
      enum: ["grey_structure", "complete"],
      required: true,
    },

    mode: {
      type: String,
      enum: ["with_material", "without_material"],
      required: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PopularCalculation",
  PopularCalculationSchema
);