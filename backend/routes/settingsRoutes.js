import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { isValidEmail, normalizeEmail, normalizeText } from '../utils/validation.js';

const router = express.Router();
const allowedThemes = new Set(['light', 'dark']);

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  theme: user.theme || 'light',
  role: user.role || 'storekeeper',
  adminId: user.adminId,
  mustChangePassword: Boolean(user.mustChangePassword),
});

// @desc    Get the current user's profile
// @route   GET /api/settings/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    res.json({ user: serializeUser(req.user) });
  } catch (error) {
    console.error('GET /api/settings/profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// @desc    Update the current user's profile
// @route   PUT /api/settings/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const name = normalizeText(req.body?.name, 120);
    const email = req.body?.email !== undefined ? normalizeEmail(req.body?.email) : '';
    if (!name && !email) {
      return res.status(400).json({ error: 'Name or email is required.' });
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: serializeUser(updated) });
  } catch (error) {
    console.error('PUT /api/settings/profile error:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// @desc    Change the current user's password
// @route   PUT /api/settings/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const currentPassword = req.body.currentPassword || req.body.current;
    const newPassword = req.body.newPassword || req.body.newPass || req.body.new;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const match = await user.matchPassword(currentPassword);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    user.password = newPassword;
    if (user.mustChangePassword) {
      user.mustChangePassword = false;
    }
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) {
    console.error('PUT /api/settings/password error:', error);
    res.status(500).json({ error: 'Server error updating password.' });
  }
});

// @desc    Get the current user's theme preference
// @route   GET /api/settings/theme
// @access  Private
router.get('/theme', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    res.json({ theme: req.user.theme || 'light' });
  } catch (error) {
    console.error('GET /api/settings/theme error:', error);
    res.status(500).json({ error: 'Server error fetching theme.' });
  }
});

// @desc    Update the current user's theme preference
// @route   PUT /api/settings/theme
// @access  Private
router.put('/theme', protect, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    if (!allowedThemes.has(theme)) {
      return res.status(400).json({ error: 'Theme must be light or dark.' });
    }

    req.user.theme = theme;
    await req.user.save();
    res.json({ theme: req.user.theme });
  } catch (error) {
    console.error('PUT /api/settings/theme error:', error);
    res.status(500).json({ error: 'Server error updating theme.' });
  }
});

export default router;
