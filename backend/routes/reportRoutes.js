import express from 'express';
import mongoose from 'mongoose';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';
import Sale from '../models/Sale.js';

const router = express.Router();

const getOwnerId = (user) => {
  if (!user) return null;
  const role = user.role || 'storekeeper';
  if (role === 'storekeeper' || role === 'sales') {
    return user.adminId || null;
  }
  return user._id;
};

const clampNumber = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

// @desc    Stock summary report
// @route   GET /api/reports/stock-summary
// @access  Private (admin)
router.get('/stock-summary', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const days = clampNumber(req.query.expiringWithinDays || '30', 30, 1, 365);
    const now = new Date();
    const expiringUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const [
      totalItems,
      totalsAgg,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredCount,
    ] =
      await Promise.all([
        Item.countDocuments({ user: ownerId }),
        Item.aggregate([
          { $match: { user: ownerId } },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$quantity' },
              totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
            },
          },
        ]),
        Item.countDocuments({ user: ownerId, $expr: { $lte: ['$quantity', '$reorderLevel'] } }),
        Item.countDocuments({ user: ownerId, quantity: { $lte: 0 } }),
        Item.countDocuments({ user: ownerId, expiryDate: { $gte: now, $lte: expiringUntil } }),
        Item.countDocuments({ user: ownerId, expiryDate: { $lt: now } }),
      ]);

    const totals = totalsAgg[0] || { totalQuantity: 0, totalValue: 0 };

    res.json({
      totalItems,
      totalQuantity: totals.totalQuantity || 0,
      totalValue: totals.totalValue || 0,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredCount,
      expiringWithinDays: days,
    });
  } catch (error) {
    console.error('GET /api/reports/stock-summary error:', error);
    res.status(500).json({ error: 'Server error generating stock summary.' });
  }
});

// @desc    Low-stock report (list)
// @route   GET /api/reports/low-stock
// @access  Private (admin)
router.get('/low-stock', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const limit = clampNumber(req.query.limit || '100', 100, 1, 500);

    const items = await Item.find({
      user: ownerId,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    })
      .sort({ quantity: 1 })
      .limit(limit)
      .populate('location', 'name')
      .populate('category', 'name');

    res.json({ count: items.length, items });
  } catch (error) {
    console.error('GET /api/reports/low-stock error:', error);
    res.status(500).json({ error: 'Server error generating low-stock report.' });
  }
});

// @desc    Detailed sales report
// @route   GET /api/reports/sales
// @access  Private (admin)
router.get('/sales', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const limit = clampNumber(req.query.limit || '100', 100, 1, 500);
    const page = clampNumber(req.query.page || '1', 1, 1, 100000);
    const skip = (page - 1) * limit;

    const query = { admin: ownerId };

    if ((req.user.role || 'storekeeper') === 'sales') {
      query.salesperson = req.user._id;
    } else if (req.query?.salespersonId) {
      const salespersonId = String(req.query.salespersonId).trim();
      if (!mongoose.Types.ObjectId.isValid(salespersonId)) {
        return res.status(400).json({ error: 'Invalid salesperson ID.' });
      }
      query.salesperson = salespersonId;
    }

    if (req.query?.itemId) {
      const itemId = String(req.query.itemId).trim();
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID.' });
      }
      query.item = itemId;
    }

    if (req.query?.locationId) {
      const locationId = String(req.query.locationId).trim();
      if (!mongoose.Types.ObjectId.isValid(locationId)) {
        return res.status(400).json({ error: 'Invalid location ID.' });
      }
      query.location = locationId;
    }

    if (req.query?.receipt) {
      query.receiptNumber = String(req.query.receipt).trim();
    }

    if (req.query?.search) {
      const search = String(req.query.search).trim();
      if (search) {
        query.$or = [
          { itemName: { $regex: search, $options: 'i' } },
          { batchNumber: { $regex: search, $options: 'i' } },
          { receiptNumber: { $regex: search, $options: 'i' } },
        ];
      }
    }

    if (req.query?.from || req.query?.to) {
      const range = {};
      if (req.query.from) {
        const from = new Date(req.query.from);
        if (!Number.isNaN(from.getTime())) {
          range.$gte = from;
        }
      }
      if (req.query.to) {
        const to = new Date(req.query.to);
        if (!Number.isNaN(to.getTime())) {
          range.$lte = to;
        }
      }
      if (Object.keys(range).length > 0) {
        query.soldAt = range;
      }
    }

    const [summaryAgg, totalCount, sales] = await Promise.all([
      Sale.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: '$total' },
          },
        },
      ]),
      Sale.countDocuments(query),
      Sale.find(query)
        .sort({ soldAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('salesperson', 'name email')
        .populate('location', 'name'),
    ]);

    const summary = summaryAgg[0] || { totalSales: 0, totalQuantity: 0, totalRevenue: 0 };

    res.json({
      summary,
      page,
      limit,
      totalCount,
      sales,
    });
  } catch (error) {
    console.error('GET /api/reports/sales error:', error);
    res.status(500).json({ error: 'Server error generating sales report.' });
  }
});

export default router;
