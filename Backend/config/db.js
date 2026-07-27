import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure (1) if database connection fails
    process.exit(1);
  }
};

// Handle connection events after initial connection
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected! Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

export default connectDB;