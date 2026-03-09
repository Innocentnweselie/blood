import express from 'express';
import Location from '../models/Location.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { normalizeText } from '../utils/validation.js';

const router = express.Router();

const DEFAULT_LOCATIONS = ['Bonaberi', 'Bonamussadi'];

const getOwnerId = (user) => {
  if (!user) return null;
  if ((user.role || 'storekeeper') === 'storekeeper' || (user.role || 'storekeeper') === 'sales') {
    return user.adminId || null;
  }
  return user._id;
};

// @desc    List locations for the logged-in admin (or linked admin for storekeeper)
// @route   GET /api/locations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    let locations = await Location.find({ admin: ownerId }).sort({ createdAt: 1 });
    if (locations.length === 0) {
      await Location.insertMany(
        DEFAULT_LOCATIONS.map((name) => ({
          admin: ownerId,
          name,
          isDefault: true,
        }))
      );
      locations = await Location.find({ admin: ownerId }).sort({ createdAt: 1 });
    }

    res.json(locations);
  } catch (error) {
    console.error('GET /api/locations error:', error);
    res.status(500).json({ error: 'Server error fetching locations.' });
  }
});

// @desc    Create a new location
// @route   POST /api/locations
// @access  Private (admin)
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const name = normalizeText(req.body?.name, 120);
    if (!name) {
      return res.status(400).json({ error: 'Location name is required.' });
    }

    const existing = await Location.findOne({ admin: req.user._id, name });
    if (existing) {
      return res.status(400).json({ error: 'Location already exists.' });
    }

    const location = await Location.create({
      admin: req.user._id,
      name,
      isDefault: false,
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('POST /api/locations error:', error);
    res.status(500).json({ error: 'Server error creating location.' });
  }
});

export default router;
