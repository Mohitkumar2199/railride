const express = require("express");
const router = express.Router();
const { searchTrains, getTrainById, createTrain, updateTrain, deleteTrain, getAllTrains } = require("../Controllers/trainController");
const { protect, adminOnly } = require("../Middleware/authMiddleware");

router.get("/search", searchTrains);
router.get("/", protect, adminOnly, getAllTrains);
router.get("/:id", getTrainById);
router.post("/", protect, adminOnly, createTrain);
router.put("/:id", protect, adminOnly, updateTrain);
router.delete("/:id", protect, adminOnly, deleteTrain);

module.exports = router;
