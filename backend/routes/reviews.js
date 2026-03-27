/**
 * routes/reviews.js — GET /api/reviews  +  POST /api/reviews
 */

"use strict";

const express = require("express");
const Review  = require("../models/Review");

const router = express.Router();

/* ─── GET /api/reviews ─────────────────────────────────────────────────────── */
// Returns the 50 most-recent reviews, newest first
router.get("/", async (_req, res, next) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("name comment createdAt")
      .lean();

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

/* ─── POST /api/reviews ────────────────────────────────────────────────────── */
router.post("/", async (req, res, next) => {
  try {
    const { name, comment } = req.body;

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required." });
    }

    const review = await Review.create({
      name:    (name || "").trim() || "Anonymous",
      comment: comment.trim(),
    });

    res.status(201).json({
      _id:       review._id,
      name:      review.name,
      comment:   review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    // Mongoose validation errors → 400
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ message });
    }
    next(err);
  }
});

module.exports = router;
