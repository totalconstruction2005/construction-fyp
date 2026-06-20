const mongoose = require('mongoose');

const breakdownNodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'BreakdownNode', default: null },
  region: { type: String, required: true }, // region name
  constructionType: { type: String, enum: ['grey','complete'], required: true },
  mode: { type: String, enum: ['with_material','without_material'], required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  requiresMaterial: { type: Boolean, default: false },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Index for fast queries
breakdownNodeSchema.index({ region: 1, constructionType: 1, mode: 1, parentId: 1, order: 1 });

module.exports = mongoose.model('BreakdownNode', breakdownNodeSchema);
