const mongoose = require("mongoose");
const Booking = require("../Models/Booking");
const Train = require("../Models/Train");
const User = require("../Models/User");

// @route POST /api/bookings
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { trainId, journeyDate, source, destination, travelClass, passengers } = req.body;

    // Validate journey date is not in the past
    if (new Date(journeyDate) < new Date().setHours(0, 0, 0, 0)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Journey date cannot be in the past" });
    }

    // Fix #5 — atomic seat check + deduction using findOneAndUpdate
    const classUpdate = await Train.findOneAndUpdate(
      {
        _id: trainId,
        "classes.type": travelClass,
        "classes.availableSeats": { $gte: passengers.length }, // ensures enough seats atomically
      },
      {
        $inc: { "classes.$.availableSeats": -passengers.length },
      },
      { new: true, session }
    );

    if (!classUpdate) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough seats available or train not found" });
    }

    const classInfo = classUpdate.classes.find((c) => c.type === travelClass);
    const totalFare = classInfo.fare * passengers.length;

    const [booking] = await Booking.create(
      [{
        user: req.user._id,
        train: trainId,
        journeyDate,
        source,
        destination,
        travelClass,
        passengers,
        totalFare,
      }],
      { session }
    );

    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } }, { session });

    await session.commitTransaction();
    await booking.populate("train", "trainName trainNumber departureTime arrivalTime");
    res.status(201).json(booking);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// @route GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("train", "trainName trainNumber departureTime arrivalTime source destination")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/bookings/pnr/:pnr
const getByPNR = async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr })
      .populate("train", "trainName trainNumber source destination departureTime arrivalTime duration");
    if (!booking) return res.status(404).json({ message: "PNR not found. Please check the number and try again." });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) { await session.abortTransaction(); return res.status(404).json({ message: "Booking not found" }); }
    if (booking.user.toString() !== req.user._id.toString()) { await session.abortTransaction(); return res.status(403).json({ message: "Not authorized to cancel this booking" }); }
    if (booking.status === "Cancelled") { await session.abortTransaction(); return res.status(400).json({ message: "Booking is already cancelled" }); }

    // Check journey is in the future (can't cancel past journeys)
    if (new Date(booking.journeyDate) < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot cancel a past journey" });
    }

    booking.status = "Cancelled";
    booking.paymentStatus = "Refunded";
    await booking.save({ session });

    // Restore seats atomically
    await Train.findOneAndUpdate(
      { _id: booking.train, "classes.type": booking.travelClass },
      { $inc: { "classes.$.availableSeats": booking.passengers.length } },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: "Booking cancelled successfully. Refund will be processed in 5–7 days.", booking });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

module.exports = { createBooking, getMyBookings, getByPNR, cancelBooking };
