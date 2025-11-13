const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// CREATE
router.post('/', async (req, res) => {
  try {
    const { name, batchNumber, quantity, reorderLevel, expiryDate } = req.body;

    if (!name || !batchNumber || !quantity || !reorderLevel || !expiryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
