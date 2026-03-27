/**
 * config/db.js — Mongoose connection to MongoDB Atlas
 */

"use strict";

const mongoose = require("mongoose");

const MAX_RETRIES    = 5;
const RETRY_INTERVAL = 3000; // ms

async function connectDB(attempt = 1) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file or Render environment variables."
    );
  }

  try {
    await mongoose.connect(uri, {
      // Mongoose 8 — no deprecated options needed
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅  MongoDB Atlas connected");
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`⚠️  MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${RETRY_INTERVAL / 1000}s…`);
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL));
      return connectDB(attempt + 1);
    }
    console.error("❌  MongoDB connection failed after max retries:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected")
);
mongoose.connection.on("reconnected",  () =>
  console.log("✅  MongoDB reconnected")
);

module.exports = connectDB;
