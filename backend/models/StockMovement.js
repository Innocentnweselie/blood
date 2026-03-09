import mongoose from 'mongoose';

const stockMovementSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    user: {
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
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUST'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    beforeQuantity: { type: Number, required: true, min: 0 },
    afterQuantity: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
