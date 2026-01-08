import mongoose from 'mongoose';

// Define the item schema
const itemSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0, // Default quantity is 0
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  supplier: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the Item model
const Item = mongoose.model('Item', itemSchema);

export default Item;
