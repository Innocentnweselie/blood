require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const app = express();
const connectDB = require('./db');
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);

// Root route for testing
app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.get("/api/reviews", (req, res) => {
  res.json([
    { author: "Jane", text: "Great app!" },
    { author: "John", text: "Very helpful." }
  ]);
});

// Connect to MongoDB
connectDB();


mongoose.connection.once('open', () => {
    console.log('MongoDB Connected...');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});