const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    reorderLevel: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
