const mongoose = require('mongoose');

const regionRateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., Islamabad
  rates: {
    grey_with_material: { type: Number, required: true },
    grey_without_material: { type: Number, required: true },
    complete_with_material: { type: Number, required: true },
    complete_without_material: { type: Number, required: true },
  },
  // optional metadata
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RegionRate', regionRateSchema);
