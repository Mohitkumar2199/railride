const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  station: { type: String, required: true },
  stationCode: { type: String, required: true },
  arrivalTime: { type: String },
  departureTime: { type: String },
  day: { type: Number, default: 1 },
  distance: { type: Number, default: 0 },
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true },
  source: { type: String, required: true },
  sourceCode: { type: String, required: true },
  destination: { type: String, required: true },
  destinationCode: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  totalDistance: { type: Number, required: true },
  daysOfOperation: [{ type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }],
  stops: [stopSchema],
  classes: [{
    type: { type: String, enum: ["SL", "3A", "2A", "1A", "CC", "EC", "2S"] },
    totalSeats: { type: Number },
    availableSeats: { type: Number },
    fare: { type: Number },
  }],
  trainType: { type: String, enum: ["Express", "Superfast", "Rajdhani", "Shatabdi", "Vande Bharat", "Duronto", "Local"], default: "Express" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Train", trainSchema);
