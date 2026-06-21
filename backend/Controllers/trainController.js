const Train = require("../Models/Train");

// Map JS day number to short name
const DAY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// @route GET /api/trains/search?from=&to=&date=&class=&type=
const searchTrains = async (req, res) => {
  try {
    const { from, to, date, travelClass, type } = req.query;
    if (!from || !to) return res.status(400).json({ message: "Source and destination required" });

    const query = {
      $or: [
        { sourceCode: from.toUpperCase(), destinationCode: to.toUpperCase() },
        { source: new RegExp(from, "i"), destination: new RegExp(to, "i") },
      ],
      isActive: true,
    };

    // Filter by class availability
    if (travelClass && travelClass !== "All Classes") {
      query["classes"] = { $elemMatch: { type: travelClass, availableSeats: { $gt: 0 } } };
    }

    // Filter by train type
    if (type) query.trainType = type;

    let trains = await Train.find(query).lean();

    // Fix #8 — filter by day of operation if date provided
    if (date) {
      const dayName = DAY_MAP[new Date(date).getDay()];
      trains = trains.filter(
        (t) => t.daysOfOperation.length === 0 || t.daysOfOperation.includes(dayName)
      );
    }

    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/trains/:id
const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) return res.status(404).json({ message: "Train not found" });
    res.json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/trains  (Admin)
const createTrain = async (req, res) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json(train);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Train number already exists" });
    res.status(400).json({ message: err.message });
  }
};

// @route PUT /api/trains/:id  (Admin)
const updateTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!train) return res.status(404).json({ message: "Train not found" });
    res.json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/trains/:id  (Admin)
const deleteTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train) return res.status(404).json({ message: "Train not found" });
    res.json({ message: "Train removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/trains  (Admin)
const getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find().sort({ trainNumber: 1 });
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { searchTrains, getTrainById, createTrain, updateTrain, deleteTrain, getAllTrains };
