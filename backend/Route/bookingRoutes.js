const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { createBooking, getMyBookings, getByPNR, cancelBooking } = require("../Controllers/bookingController");
const { protect } = require("../Middleware/authMiddleware");
const validate = require("../Middleware/validate");

router.post("/", protect, [
  body("trainId").isMongoId().withMessage("Invalid train ID"),
  body("journeyDate").isISO8601().withMessage("Valid journey date required"),
  body("source").trim().notEmpty().withMessage("Source station required"),
  body("destination").trim().notEmpty().withMessage("Destination station required"),
  body("travelClass").isIn(["SL","3A","2A","1A","CC","EC","2S"]).withMessage("Invalid travel class"),
  body("passengers").isArray({ min: 1, max: 6 }).withMessage("1–6 passengers required"),
  body("passengers.*.name").trim().isLength({ min: 2 }).withMessage("Each passenger needs a name"),
  body("passengers.*.age").isInt({ min: 1, max: 120 }).withMessage("Invalid passenger age"),
  body("passengers.*.gender").isIn(["Male","Female","Other"]).withMessage("Invalid gender"),
], validate, createBooking);

router.get("/my", protect, getMyBookings);
router.get("/pnr/:pnr", getByPNR);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
