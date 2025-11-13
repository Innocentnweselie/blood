require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', productRoutes);
app.use("/api/suppliers", supplierRoutes);

// Root Test Route
app.get('/', (req, res) => {
  res.send('Inventory backend is running 🚀');
});

// Connect to MongoDB
connectDB();

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB Connected...');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
