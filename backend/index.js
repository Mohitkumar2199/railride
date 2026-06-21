const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();

// Validate env before anything else (#3)
const validateEnv = require("./Config/validateEnv");
validateEnv();

const connectDB = require("./Config/db");
connectDB();

const app = express();

// Security headers (#18)
app.use(helmet());

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS — strict, no open fallback (#18)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10kb" })); // Prevent huge payloads

// Global rate limiter — 100 req/15min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// AI routes get tighter limit — 20 req/15min (#16)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "AI rate limit reached. Please wait before trying again." },
});

// Routes
app.use("/api/auth", require("./Route/authRoutes"));
app.use("/api/trains", require("./Route/trainRoutes"));
app.use("/api/bookings", require("./Route/bookingRoutes"));
app.use("/api/ai", aiLimiter, require("./Route/aiRoutes"));

app.get("/", (req, res) => res.json({ message: "RailRide API running 🚂", env: process.env.NODE_ENV }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚂 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);

  // Keep Render free tier awake by self-pinging every 14 minutes
  if (process.env.NODE_ENV === "production") {
    const https = require("https");
    setInterval(() => {
      https.get("https://railride-backend.onrender.com", (res) => {
        console.log(`Keep-alive ping: ${res.statusCode}`);
      }).on("error", (err) => {
        console.error("Keep-alive error:", err.message);
      });
    }, 14 * 60 * 1000); // every 14 minutes
  }
});
