const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  seatNumber: { type: String },
  berthPreference: { type: String, enum: ["Lower", "Middle", "Upper", "Side Lower", "Side Upper", "No Preference"], default: "No Preference" },
});

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: "Train", required: true },
  pnr: { type: String, unique: true },
  journeyDate: { type: Date, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  travelClass: { type: String, enum: ["SL", "3A", "2A", "1A", "CC", "EC", "2S"], required: true },
  passengers: [passengerSchema],
  totalFare: { type: Number, required: true },
  status: { type: String, enum: ["Confirmed", "Waitlist", "RAC", "Cancelled"], default: "Confirmed" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Refunded"], default: "Pending" },
}, { timestamps: true });

// Auto-generate PNR before save
bookingSchema.pre("save", function (next) {
  if (!this.pnr) {
    this.pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
