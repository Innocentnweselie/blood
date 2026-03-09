import express from 'express';
import mongoose from 'mongoose';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Item from '../models/Item.js';
import Supplier from '../models/Supplier.js';
import Location from '../models/Location.js';
import StockMovement from '../models/StockMovement.js';
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

// @desc    List purchase records for the logged-in admin
// @route   GET /api/purchases
// @access  Private (admin)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const rawLimit = Number.parseInt(req.query.limit || '50', 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 200)
      : 50;

    const query = { admin: ownerId };
    if (req.query?.supplierId) {
      const supplierId = String(req.query.supplierId).trim();
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        return res.status(400).json({ error: 'Invalid supplier ID.' });
      }
      query.supplier = supplierId;
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
        query.purchasedAt = range;
      }
    }

    const purchases = await Purchase.find(query)
      .sort({ purchasedAt: -1 })
      .limit(limit)
      .populate('supplier', 'name')
      .populate('createdBy', 'name email')
      .populate('location', 'name');

    res.json(purchases);
  } catch (error) {
    console.error('GET /api/purchases error:', error);
    res.status(500).json({ error: 'Server error fetching purchases.' });
  }
});

// @desc    Delete a purchase record (admin only)
// @route   DELETE /api/purchases/:id
// @access  Private (admin)
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found.' });
    }

    if (purchase.admin.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this purchase.' });
    }

    await Purchase.findByIdAndDelete(purchase._id);
    res.json({ message: 'Purchase deleted.' });
  } catch (error) {
    console.error('DELETE /api/purchases/:id error:', error);
    res.status(500).json({ error: 'Server error deleting purchase.' });
  }
});

// @desc    Create a purchase record and increase stock
// @route   POST /api/purchases
// @access  Private (admin)
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'At least one purchase item is required.' });
    }

    let supplier = null;
    if (req.body?.supplierId) {
      const supplierId = String(req.body.supplierId).trim();
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        return res.status(400).json({ error: 'Invalid supplier ID.' });
      }
      supplier = await Supplier.findOne({ _id: supplierId, user: ownerId });
      if (!supplier) {
        return res.status(400).json({ error: 'Supplier not found.' });
      }
    }

    let location = null;
    if (req.body?.locationId) {
      try {
        location = await resolveLocation(ownerId, req.body.locationId);
      } catch (locError) {
        return res.status(400).json({ error: locError.message });
      }
    }

    const purchaseItems = [];
    const movements = [];
    let totalQuantity = 0;
    let totalCost = 0;

    for (const entry of items) {
      const itemId = entry?.itemId;
      const qty = parseQuantity(entry?.quantity);
      if (!itemId || !Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Each item must include a valid itemId and quantity.' });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: `Item not found: ${itemId}` });
      }
      if (item.user.toString() !== ownerId.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this item.' });
      }

      const unitPriceRaw = Number(entry?.unitPrice);
      const unitPrice = Number.isFinite(unitPriceRaw)
        ? unitPriceRaw
        : Number(item.price) || 0;

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ error: 'Unit price must be a valid number.' });
      }

      const before = Number(item.quantity) || 0;
      const after = before + qty;
      item.quantity = after;
      if (location) {
        item.location = location._id;
      }
      await item.save();

      const lineTotal = unitPrice * qty;

      purchaseItems.push({
        item: item._id,
        itemName: item.name,
        batchNumber: item.batchNumber,
        quantity: qty,
        unitPrice,
        total: lineTotal,
      });

      movements.push({
        admin: ownerId,
        user: req.user._id,
        item: item._id,
        location: location?._id || item.location,
        type: 'IN',
        quantity: qty,
        beforeQuantity: before,
        afterQuantity: after,
        note: req.body?.note ? String(req.body.note).trim() : undefined,
      });

      totalQuantity += qty;
      totalCost += lineTotal;
    }

    const purchasedAt = req.body?.purchasedAt ? new Date(req.body.purchasedAt) : new Date();
    const safePurchasedAt = Number.isNaN(purchasedAt.getTime()) ? new Date() : purchasedAt;

    const purchase = await Purchase.create({
      admin: ownerId,
      createdBy: req.user._id,
      supplier: supplier?._id,
      supplierName: supplier?.name || (req.body?.supplierName ? String(req.body.supplierName).trim() : undefined),
      location: location?._id,
      items: purchaseItems,
      totalQuantity,
      totalCost,
      note: req.body?.note ? String(req.body.note).trim() : undefined,
      purchasedAt: safePurchasedAt,
    });

    if (movements.length > 0) {
      await StockMovement.insertMany(movements);
    }

    const populated = await Purchase.findById(purchase._id)
      .populate('supplier', 'name')
      .populate('createdBy', 'name email')
      .populate('location', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('POST /api/purchases error:', error);
    res.status(500).json({ error: 'Server error recording purchase.' });
  }
});

export default router;
