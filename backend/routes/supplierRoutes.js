import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Supplier from '../models/Supplier.js';
import { isValidEmail, normalizeEmail, normalizeText } from '../utils/validation.js';

const router = express.Router();

const getOwnerId = (user) => {
  if (!user) return null;
  const role = user.role || 'storekeeper';
  if (role === 'storekeeper' || role === 'sales') {
    return user.adminId || null;
  }
  return user._id;
};

// @desc    Get all suppliers for a logged-in admin
// @route   GET /api/suppliers
// @access  Private (admin)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user data missing from request.' });
    }
    const ownerId = getOwnerId(req.user);
    if (!ownerId) {
      return res.status(400).json({ error: 'Storekeeper account is not linked to an admin.' });
    }
    const suppliers = await Supplier.find({ user: ownerId }).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    console.error('GET /api/suppliers error:', error);
    res.status(500).json({ error: 'Server error fetching suppliers.' });
  }
});

// @desc    Create a new supplier for the logged-in user
// @route   POST /api/suppliers
// @access  Private
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user data missing from request.' });
    }
    const name = normalizeText(req.body?.name, 120);
    const contact = normalizeText(req.body?.contact, 120);
    const email = normalizeEmail(req.body?.email);
    if (!name || !contact || !email) {
      return res.status(400).json({ error: 'Name, contact, and email are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const newSupplier = new Supplier({
      name,
      contact,
      email,
      user: req.user._id, // Link to the logged-in user
    });
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error('POST /api/suppliers error:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error creating supplier.' });
  }
});

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    if (!req.user || supplier.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const updates = {};
    if (req.body?.name !== undefined) {
      const name = normalizeText(req.body.name, 120);
      if (!name) {
        return res.status(400).json({ error: 'Supplier name is required.' });
      }
      updates.name = name;
    }
    if (req.body?.contact !== undefined) {
      const contact = normalizeText(req.body.contact, 120);
      if (!contact) {
        return res.status(400).json({ error: 'Supplier contact is required.' });
      }
      updates.contact = contact;
    }
    if (req.body?.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }
      updates.email = email;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedSupplier);
  } catch (error) {
    console.error(`PUT /api/suppliers/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error updating supplier.' });
  }
});

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    if (!req.user || supplier.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    console.error(`DELETE /api/suppliers/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error deleting supplier.' });
  }
});

export default router;
