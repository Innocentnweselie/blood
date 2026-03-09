import mongoose from 'mongoose';

const purchaseItemSchema = mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Item',
    },
    itemName: { type: String, required: true },
    batchNumber: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    supplierName: { type: String },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    items: { type: [purchaseItemSchema], required: true },
    totalQuantity: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

purchaseSchema.index({ admin: 1, purchasedAt: -1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
