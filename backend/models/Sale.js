import mongoose from 'mongoose';

const saleSchema = mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item',
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  itemName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
  receiptNumber: { type: String, required: true },
  soldAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
