const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, getMe, changePassword } = require("../Controllers/authController");
const { protect } = require("../Middleware/authMiddleware");
const validate = require("../Middleware/validate");
const rateLimit = require("express-rate-limit");

// Strict limiter for auth endpoints — 10 attempts / 15min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please wait 15 minutes." },
});

router.post("/register", authLimiter, [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").optional().isMobilePhone("en-IN").withMessage("Invalid Indian phone number"),
], validate, register);

router.post("/login", authLimiter, [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
], validate, login);

router.get("/me", protect, getMe);

router.put("/change-password", protect, [
  body("currentPassword").notEmpty().withMessage("Current password required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
], validate, changePassword);

module.exports = router;
