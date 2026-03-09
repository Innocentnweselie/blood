import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Item from '../models/Item.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const getOwnerId = (user) => {
  if (!user) return null;
  const role = user.role || 'storekeeper';
  if (role === 'storekeeper' || role === 'sales') {
    return user.adminId || null;
  }
  return user._id;
};

// @desc    List categories for the logged-in admin
// @route   GET /api/categories
// @access  Private (admin)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const categories = await Category.find({ user: ownerId }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (admin)
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const existing = await Category.findOne({ user: req.user._id, name });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      description: description || undefined,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'Category already exists.' });
    }
    console.error('POST /api/categories error:', error);
    res.status(500).json({ error: 'Server error creating category.' });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (admin)
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid category ID.' });
    }

    const updates = {};
    if (req.body?.name !== undefined) {
      const name = String(req.body.name || '').trim();
      if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
      }
      updates.name = name;
    }
    if (req.body?.description !== undefined) {
      const description = String(req.body.description || '').trim();
      updates.description = description || undefined;
    }

    const updated = await Category.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'Category already exists.' });
    }
    console.error('PUT /api/categories/:id error:', error);
    res.status(500).json({ error: 'Server error updating category.' });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (admin)
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid category ID.' });
    }

    const category = await Category.findOneAndDelete({ _id: id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    await Item.updateMany(
      { user: req.user._id, category: category._id },
      { $unset: { category: '' } }
    );

    res.json({ message: 'Category deleted.' });
  } catch (error) {
    console.error('DELETE /api/categories/:id error:', error);
    res.status(500).json({ error: 'Server error deleting category.' });
  }
});

export default router;
