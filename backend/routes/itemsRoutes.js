// routes/itemRoutes.js
import express from 'express';
import Item from '../models/Item.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all items (public route)
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Server error while fetching items.' });
  }
});

// CREATE new item (protected route)
router.post('/items', protect, async (req, res) => {
  try {
    const { item, quantity, expiryDate, supplier } = req.body;
    const newItem = await Item.create({ item, quantity, expiryDate, supplier });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Server error while creating item.' });
  }
});

export default router;
