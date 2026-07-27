import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json()); // Essential for parsing incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is up and running!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Gracefully close server & exit process
  server.close(() => process.exit(1));
});