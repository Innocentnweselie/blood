import express from 'express';
import mongoose from 'mongoose';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';
import Location from '../models/Location.js';
import Category from '../models/Category.js';
import { normalizeText, parseDate, parseNumber } from '../utils/validation.js';

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

const buildItemPayload = (body, { requireAll = false } = {}) => {
  const payload = {};
  const errors = [];

  const name = normalizeText(body?.name, 120);
  if (requireAll && !name) errors.push('Name is required.');
  if (name) payload.name = name;

  const batchNumber = normalizeText(body?.batchNumber, 80);
  if (requireAll && !batchNumber) errors.push('Batch number is required.');
  if (batchNumber) payload.batchNumber = batchNumber;

  const quantity = parseNumber(body?.quantity);
  if (requireAll && !Number.isFinite(quantity)) errors.push('Quantity is required.');
  if (Number.isFinite(quantity)) {
    if (quantity < 0) {
      errors.push('Quantity must be 0 or more.');
    } else {
      payload.quantity = quantity;
    }
  }

  const price = parseNumber(body?.price);
  if (requireAll && !Number.isFinite(price)) errors.push('Price is required.');
  if (Number.isFinite(price)) {
    if (price < 0) {
      errors.push('Price must be 0 or more.');
    } else {
      payload.price = price;
    }
  }

  const reorderLevel = parseNumber(body?.reorderLevel);
  if (requireAll && !Number.isFinite(reorderLevel)) errors.push('Reorder level is required.');
  if (Number.isFinite(reorderLevel)) {
    if (reorderLevel < 0) {
      errors.push('Reorder level must be 0 or more.');
    } else {
      payload.reorderLevel = reorderLevel;
    }
  }

  const expiryDate = parseDate(body?.expiryDate);
  if (requireAll && !expiryDate) errors.push('Expiry date is required.');
  if (expiryDate) payload.expiryDate = expiryDate;

  const supplier = normalizeText(body?.supplier, 120);
  if (supplier) payload.supplier = supplier;

  const barcode = normalizeText(body?.barcode, 80);
  if (barcode) payload.barcode = barcode;

  return { payload, errors };
};

// @desc    Fetch all items for a logged-in user
// @route   GET /api/items
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user data missing from request.' });
    }
    const role = req.user.role || 'storekeeper';
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const query = { user: ownerId };
    const now = new Date();
    if (role === 'sales') {
      query.expiryDate = { $gt: now };
    }
    if (req.query?.barcode) {
      query.barcode = String(req.query.barcode).trim();
    }
    if (req.query?.search) {
      const search = String(req.query.search).trim();
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { batchNumber: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
        ];
      }
    }
    if (req.query?.supplier) {
      const supplier = String(req.query.supplier).trim();
      if (supplier) {
        query.supplier = { $regex: supplier, $options: 'i' };
      }
    }
    if (req.query?.categoryId) {
      const categoryId = String(req.query.categoryId).trim();
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID.' });
      }
      query.category = categoryId;
    }
    if (req.query?.locationId) {
      const locationId = String(req.query.locationId).trim();
      if (!mongoose.Types.ObjectId.isValid(locationId)) {
        return res.status(400).json({ error: 'Invalid location ID.' });
      }
      query.location = locationId;
    }
    if (req.query?.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderLevel'] };
    }
    if (role !== 'sales' && req.query?.expiry) {
      const expiry = String(req.query.expiry).trim().toLowerCase();
      if (expiry === 'expired') {
        query.expiryDate = { $lt: now };
      } else if (expiry === 'soon') {
        const days = clampNumber(
          req.query.expiringWithinDays || req.query.days || '30',
          30,
          1,
          365
        );
        const expiringUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        query.expiryDate = { $gte: now, $lte: expiringUntil };
      }
    }

    const items = await Item.find(query)
      .populate('location', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('GET /api/items error:', error);
    res.status(500).json({ error: 'Server error fetching items.' });
  }
});

// @desc    Get a single item by ID
// @route   GET /api/items/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user data missing from request.' });
    }
    const item = await Item.findById(req.params.id)
      .populate('location', 'name')
      .populate('category', 'name');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const role = req.user.role || 'storekeeper';
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    if (item.user.toString() !== ownerId.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (role === 'sales' && item.expiryDate) {
      const expiry = new Date(item.expiryDate);
      if (expiry <= new Date()) {
        return res.status(404).json({ error: 'Item not found' });
      }
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching item' });
  }
});

// @desc    Create a new item for the logged-in user
// @route   POST /api/items
// @access  Private
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user data missing from request.' });
    }
    const { payload, errors } = buildItemPayload(req.body, { requireAll: true });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }
    let locationId;
    if (req.body?.locationId) {
      const rawLocationId = String(req.body.locationId).trim();
      if (!mongoose.Types.ObjectId.isValid(rawLocationId)) {
        return res.status(400).json({ error: 'Invalid location ID.' });
      }
      const location = await Location.findOne({ _id: rawLocationId, admin: req.user._id });
      if (!location) {
        return res.status(400).json({ error: 'Location not found.' });
      }
      locationId = location._id;
    } else {
      const fallback = await Location.findOne({ admin: req.user._id }).sort({ createdAt: 1 });
      if (fallback) {
        locationId = fallback._id;
      }
    }

    let categoryId;
    if (req.body?.categoryId) {
      const rawCategoryId = String(req.body.categoryId).trim();
      if (!mongoose.Types.ObjectId.isValid(rawCategoryId)) {
        return res.status(400).json({ error: 'Invalid category ID.' });
      }
      const category = await Category.findOne({ _id: rawCategoryId, user: req.user._id });
      if (!category) {
        return res.status(400).json({ error: 'Category not found.' });
      }
      categoryId = category._id;
    }

    const itemPayload = { ...payload, location: locationId, category: categoryId };
    delete itemPayload.locationId;
    delete itemPayload.categoryId;
    const newItem = new Item({
      ...itemPayload,
      user: req.user._id, // Link the item to the logged-in user
    });
    const savedItem = await newItem.save();
    const populated = await Item.findById(savedItem._id)
      .populate('location', 'name')
      .populate('category', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('POST /api/items error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error creating item.' });
  }
});

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Check if the item belongs to the user
    if (!req.user || item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const { payload, errors } = buildItemPayload(req.body, { requireAll: false });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }
    const updates = { ...payload };
    if (req.body?.locationId) {
      const rawLocationId = String(req.body.locationId).trim();
      if (!mongoose.Types.ObjectId.isValid(rawLocationId)) {
        return res.status(400).json({ error: 'Invalid location ID.' });
      }
      const location = await Location.findOne({ _id: rawLocationId, admin: req.user._id });
      if (!location) {
        return res.status(400).json({ error: 'Location not found.' });
      }
      updates.location = location._id;
      delete updates.locationId;
    }
    if (req.body?.categoryId) {
      const rawCategoryId = String(req.body.categoryId).trim();
      if (!mongoose.Types.ObjectId.isValid(rawCategoryId)) {
        return res.status(400).json({ error: 'Invalid category ID.' });
      }
      const category = await Category.findOne({ _id: rawCategoryId, user: req.user._id });
      if (!category) {
        return res.status(400).json({ error: 'Category not found.' });
      }
      updates.category = category._id;
      delete updates.categoryId;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('location', 'name')
      .populate('category', 'name');
    res.json(updatedItem);
  } catch (error) {
    console.error(`PUT /api/items/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error updating item.' });
  }
});

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Check if the item belongs to the user
    if (!req.user || item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error(`DELETE /api/items/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error deleting item.' });
  }
});

export default router;
