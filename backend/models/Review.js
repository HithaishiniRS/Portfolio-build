/**
 * models/Review.js — Mongoose schema for portfolio reviews
 */

"use strict";

const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [80, "Name must be 80 characters or fewer"],
      default: "Anonymous",
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [2, "Comment must be at least 2 characters"],
      maxlength: [1000, "Comment must be 1000 characters or fewer"],
    },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
    versionKey: false,
  }
);

// Index to support fetching newest-first efficiently
reviewSchema.index({ createdAt: -1 });

module.exports = model("Review", reviewSchema);
