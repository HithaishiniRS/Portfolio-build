/**
 * server.js — Express entry point
 * Serves the frontend as static files AND the /api routes.
 */
 
"use strict";
 
require("dotenv").config();
 
const path      = require("path");
const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
 
const connectDB     = require("./config/db");
const reviewsRouter = require("./routes/reviews");
 
/* ─── App ─────────────────────────────────────────────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 5000;
 
/* ─── Security & Utilities ─────────────────────────────────────────────────── */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:    ["'self'", "https://fonts.gstatic.com"],
        imgSrc:     ["'self'", "data:"],
      },
    },
  })
);
 
// Frontend and backend are the same Render service — reflect origin back safely
app.use(cors({ origin: true, methods: ["GET", "POST"] }));
 
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "16kb" }));
 
/* ─── Rate limiting ─────────────────────────────────────────────────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
 
/* ─── Routes ────────────────────────────────────────────────────────────────── */
app.use("/api/reviews", apiLimiter, reviewsRouter);
 
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));
 
/* ─── Serve static frontend ─────────────────────────────────────────────────── */
const FRONTEND = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND));
 
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND, "index.html"));
});
 
/* ─── Global error handler ──────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});
 
/* ─── Boot — skipped when required by tests ─────────────────────────────────── */
if (require.main === module) {
  (async () => {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}  [${process.env.NODE_ENV || "development"}]`)
    );
  })();
}
 
module.exports = app;