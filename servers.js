import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.error("MongoDB Error:", err));

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.listen(5000, () => console.log("Server running on port 5000"));