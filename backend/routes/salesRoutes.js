import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';
import Sale from '../models/Sale.js';

const router = express.Router();

const buildReceiptNumber = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MT-${stamp}-${rand}`;
};

// @desc    Fetch recent sales for the logged-in admin
// @route   GET /api/sales
// @access  Private (admin)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const rawLimit = Number.parseInt(req.query.limit || '20', 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 100)
      : 20;

    const sales = await Sale.find({ admin: req.user._id })
      .sort({ soldAt: -1 })
      .limit(limit)
      .populate('salesperson', 'name email')
      .populate('location', 'name');

    res.json(sales);
  } catch (error) {
    console.error('GET /api/sales error:', error);
    res.status(500).json({ error: 'Server error fetching sales.' });
  }
});

// @desc    Delete a sale record (admin only)
// @route   DELETE /api/sales/:id
// @access  Private (admin)
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found.' });
    }

    if (sale.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this sale.' });
    }

    await Sale.findByIdAndDelete(sale._id);
    res.json({ message: 'Sale deleted.' });
  } catch (error) {
    console.error('DELETE /api/sales/:id error:', error);
    res.status(500).json({ error: 'Server error deleting sale.' });
  }
});

// @desc    Record a sale (item issue) and reduce item quantity
// @route   POST /api/sales
// @access  Private (storekeeper)
router.post('/', protect, requireRole('storekeeper', 'sales'), async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const saleQty = Number(quantity);
    if (!itemId || !Number.isFinite(saleQty) || saleQty <= 0) {
      return res.status(400).json({ error: 'Valid item and quantity are required.' });
    }

    if (!req.user?.adminId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.user.toString() !== req.user.adminId.toString()) {
      return res.status(403).json({ error: 'Not authorized to sell this item.' });
    }

    const now = new Date();
    if (item.expiryDate && new Date(item.expiryDate) <= now) {
      return res.status(400).json({ error: 'Item is expired and cannot be sold.' });
    }

    const availableQty = Number(item.quantity) || 0;
    if (availableQty < saleQty) {
      return res.status(400).json({ error: 'Insufficient stock for this sale.' });
    }

    const unitPrice = Number(item.price) || 0;
    const total = unitPrice * saleQty;
    const receiptNumber = buildReceiptNumber();

    item.quantity = availableQty - saleQty;
    await item.save();

    const sale = await Sale.create({
      admin: req.user.adminId,
      salesperson: req.user._id,
      item: item._id,
      location: item.location || undefined,
      itemName: item.name,
      batchNumber: item.batchNumber,
      unitPrice,
      quantity: saleQty,
      total,
      receiptNumber,
      soldAt: new Date(),
    });

    await sale.populate('location', 'name');

    res.status(201).json({
      sale,
      item: { _id: item._id, quantity: item.quantity },
    });
  } catch (error) {
    console.error('POST /api/sales error:', error);
    res.status(500).json({ error: 'Server error recording sale.' });
  }
});

export default router;
