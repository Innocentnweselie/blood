import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import Item from './models/Item.js';
import User from './models/User.js';  // User model
import protect from './middleware/authMiddleware.js'; // Protect route middleware

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// GET ALL ITEMS
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error?.stack || error);
    res.status(500).json({ error: "Server error while fetching items." });
  }
});

// CONTACT ROUTE - receives messages from the frontend contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    // For now just log the message; later this can be stored or emailed
    console.log('Contact form submission:', { name, email, message });

    // Respond with success
    return res.status(200).json({ message: 'Message received. Thank you!' });
  } catch (err) {
    console.error('Error handling contact form:', err);
    return res.status(500).json({ error: 'Server error while sending message.' });
  }
});

// CREATE A NEW ITEM
app.post("/api/items", protect, async (req, res) => {
  try {
    const { item, quantity, expiryDate, supplier } = req.body;
    const newItem = await Item.create({
      item,
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      supplier,
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Server error while creating item." });
  }
});

// UPDATE AN ITEM
app.put("/api/items/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { item, quantity, expiryDate, supplier } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { item, quantity, expiryDate: expiryDate ? new Date(expiryDate) : undefined, supplier },
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Server error while updating item." });
  }
});

// DELETE AN ITEM
app.delete("/api/items/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    await Item.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Server error while deleting item." });
  }
});

// SIGNUP ROUTE
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: "User with this email already exists." });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ email, password: hashedPassword });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Server error during signup." });
  }
});

// LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

// Start server after DB connection
const start = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend API running at http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Kill the process or change the port.`);
        process.exit(1);
      }
      console.error('Server error:', err);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

