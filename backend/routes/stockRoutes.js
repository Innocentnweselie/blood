import express from 'express';
import mongoose from 'mongoose';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';
import Location from '../models/Location.js';
import StockMovement from '../models/StockMovement.js';

const router = express.Router();

const getOwnerId = (user) => {
  if (!user) return null;
  const role = user.role || 'storekeeper';
  if (role === 'storekeeper' || role === 'sales') {
    return user.adminId || null;
  }
  return user._id;
};

const parseQuantity = (value) => {
  const qty = Number(value);
  return Number.isFinite(qty) ? qty : NaN;
};

const resolveLocation = async (ownerId, rawLocationId) => {
  if (!rawLocationId) return null;
  const locationId = String(rawLocationId).trim();
  if (!mongoose.Types.ObjectId.isValid(locationId)) {
    throw new Error('Invalid location ID.');
  }
  const location = await Location.findOne({ _id: locationId, admin: ownerId });
  if (!location) {
    throw new Error('Location not found.');
  }
  return location;
};

const buildMovementResponse = (movement) => ({
  _id: movement._id,
  item: movement.item,
  type: movement.type,
  quantity: movement.quantity,
  beforeQuantity: movement.beforeQuantity,
  afterQuantity: movement.afterQuantity,
  note: movement.note,
  createdAt: movement.createdAt,
});

// @desc    Stock in (increase quantity)
// @route   POST /api/stock/in
// @access  Private (admin)
router.post('/in', protect, requireRole('admin'), async (req, res) => {
  try {
    const { itemId, quantity, note, locationId } = req.body;
    const qty = parseQuantity(quantity);
    if (!itemId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Valid item and quantity are required.' });
    }

    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    if (item.user.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this item.' });
    }

    let location = null;
    if (locationId) {
      try {
        location = await resolveLocation(ownerId, locationId);
      } catch (locError) {
        return res.status(400).json({ error: locError.message });
      }
    }

    const before = Number(item.quantity) || 0;
    const after = before + qty;

    item.quantity = after;
    if (location) {
      item.location = location._id;
    }
    await item.save();

    const movement = await StockMovement.create({
      admin: ownerId,
      user: req.user._id,
      item: item._id,
      location: location?._id || item.location,
      type: 'IN',
      quantity: qty,
      beforeQuantity: before,
      afterQuantity: after,
      note: note ? String(note).trim() : undefined,
    });

    res.status(201).json({
      item: { _id: item._id, quantity: item.quantity },
      movement: buildMovementResponse(movement),
    });
  } catch (error) {
    console.error('POST /api/stock/in error:', error);
    res.status(500).json({ error: 'Server error updating stock.' });
  }
});

// @desc    Stock out (decrease quantity)
// @route   POST /api/stock/out
// @access  Private (admin)
router.post('/out', protect, requireRole('admin'), async (req, res) => {
  try {
    const { itemId, quantity, note, locationId } = req.body;
    const qty = parseQuantity(quantity);
    if (!itemId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Valid item and quantity are required.' });
    }

    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    if (item.user.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this item.' });
    }

    let location = null;
    if (locationId) {
      try {
        location = await resolveLocation(ownerId, locationId);
      } catch (locError) {
        return res.status(400).json({ error: locError.message });
      }
    }

    const before = Number(item.quantity) || 0;
    if (before < qty) {
      return res.status(400).json({ error: 'Insufficient stock for this operation.' });
    }
    const after = before - qty;

    item.quantity = after;
    if (location) {
      item.location = location._id;
    }
    await item.save();

    const movement = await StockMovement.create({
      admin: ownerId,
      user: req.user._id,
      item: item._id,
      location: location?._id || item.location,
      type: 'OUT',
      quantity: qty,
      beforeQuantity: before,
      afterQuantity: after,
      note: note ? String(note).trim() : undefined,
    });

    res.status(201).json({
      item: { _id: item._id, quantity: item.quantity },
      movement: buildMovementResponse(movement),
    });
  } catch (error) {
    console.error('POST /api/stock/out error:', error);
    res.status(500).json({ error: 'Server error updating stock.' });
  }
});

// @desc    Adjust stock to an exact quantity
// @route   POST /api/stock/adjust
// @access  Private (admin)
router.post('/adjust', protect, requireRole('admin'), async (req, res) => {
  try {
    const { itemId, quantity, note, locationId } = req.body;
    const qty = parseQuantity(quantity);
    if (!itemId || !Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ error: 'Valid item and quantity are required.' });
    }

    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    if (item.user.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this item.' });
    }

    let location = null;
    if (locationId) {
      try {
        location = await resolveLocation(ownerId, locationId);
      } catch (locError) {
        return res.status(400).json({ error: locError.message });
      }
    }

    const before = Number(item.quantity) || 0;
    const after = qty;

    item.quantity = after;
    if (location) {
      item.location = location._id;
    }
    await item.save();

    const movement = await StockMovement.create({
      admin: ownerId,
      user: req.user._id,
      item: item._id,
      location: location?._id || item.location,
      type: 'ADJUST',
      quantity: Math.abs(after - before),
      beforeQuantity: before,
      afterQuantity: after,
      note: note ? String(note).trim() : undefined,
    });

    res.status(201).json({
      item: { _id: item._id, quantity: item.quantity },
      movement: buildMovementResponse(movement),
    });
  } catch (error) {
    console.error('POST /api/stock/adjust error:', error);
    res.status(500).json({ error: 'Server error updating stock.' });
  }
});

export default router;
