import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';

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

// @desc    Dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private (admin)
router.get('/overview', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const recentLimit = clampNumber(req.query.recentLimit || '6', 6, 1, 20);
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
      recentSales,
      recentPurchases,
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
        Sale.find({ admin: ownerId })
          .sort({ soldAt: -1 })
          .limit(recentLimit)
          .populate('salesperson', 'name email')
          .populate('location', 'name'),
        Purchase.find({ admin: ownerId })
          .sort({ purchasedAt: -1 })
          .limit(recentLimit)
          .populate('supplier', 'name')
          .populate('createdBy', 'name email')
          .populate('location', 'name'),
      ]);

    const totals = totalsAgg[0] || { totalQuantity: 0, totalValue: 0 };

    res.json({
      summary: {
        totalItems,
        totalQuantity: totals.totalQuantity || 0,
        totalValue: totals.totalValue || 0,
        lowStockCount,
        outOfStockCount,
        expiringSoonCount,
        expiredCount,
        expiringWithinDays: days,
      },
      recentSales,
      recentPurchases,
    });
  } catch (error) {
    console.error('GET /api/dashboard/overview error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard overview.' });
  }
});

export default router;
