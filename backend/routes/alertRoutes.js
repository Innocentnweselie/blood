import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';

const router = express.Router();

const getOwnerId = (user) => {
  if (!user) return null;
  const role = user.role || 'storekeeper';
  if (role === 'storekeeper' || role === 'sales') {
    return user.adminId || null;
  }
  return user._id;
};

// @desc    Fetch low-stock items
// @route   GET /api/alerts/low-stock
// @access  Private (admin)
router.get('/low-stock', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const rawLimit = Number.parseInt(req.query.limit || '100', 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 500)
      : 100;

    const items = await Item.find({
      user: ownerId,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    })
      .sort({ quantity: 1 })
      .limit(limit)
      .populate('location', 'name')
      .populate('category', 'name');

    res.json(items);
  } catch (error) {
    console.error('GET /api/alerts/low-stock error:', error);
    res.status(500).json({ error: 'Server error fetching low-stock alerts.' });
  }
});

export default router;
