import express from 'express';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { isValidEmail, normalizeEmail, normalizeText } from '../utils/validation.js';

const router = express.Router();
const MIN_PASSWORD_LENGTH = 8;

// @desc    List storekeepers for the logged-in admin
// @route   GET /api/users/storekeepers
// @access  Private (admin)
const listStorekeepers = async (req, res) => {
  try {
    const storekeepers = await User.find({
      role: { $in: ['storekeeper', 'sales'] },
      adminId: req.user._id,
    })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(storekeepers);
  } catch (error) {
    console.error('GET /api/users/storekeepers error:', error);
    res.status(500).json({ error: 'Server error fetching storekeepers.' });
  }
};

router.get('/storekeepers', protect, requireRole('admin'), listStorekeepers);
// Backward-compatible alias
router.get('/sales', protect, requireRole('admin'), listStorekeepers);

// @desc    Create a storekeeper for the logged-in admin
// @route   POST /api/users/storekeepers
// @access  Private (admin)
const createStorekeeper = async (req, res) => {
  try {
    const name = normalizeText(req.body?.name, 120);
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const storekeeper = await User.create({
      name,
      email,
      password,
      role: 'storekeeper',
      adminId: req.user._id,
      isVerified: true,
      mustChangePassword: true,
    });

    res.status(201).json({
      _id: storekeeper._id,
      name: storekeeper.name,
      email: storekeeper.email,
      role: storekeeper.role,
      adminId: storekeeper.adminId,
      mustChangePassword: storekeeper.mustChangePassword,
    });
  } catch (error) {
    console.error('POST /api/users/storekeepers error:', error);
    res.status(500).json({ error: 'Server error creating storekeeper.' });
  }
};

router.post('/storekeepers', protect, requireRole('admin'), createStorekeeper);
// Backward-compatible alias
router.post('/sales', protect, requireRole('admin'), createStorekeeper);

export default router;
