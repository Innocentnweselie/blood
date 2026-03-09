import mongoose from 'mongoose';

const itemSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: { type: String, required: true },
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  supplier: { type: String },
  barcode: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
export default Item;
