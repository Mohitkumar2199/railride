const express = require("express");
const router = express.Router();
const { planTrip, recommendSeat, chatbot } = require("../Controllers/aiController");

router.post("/plan", planTrip);
router.post("/recommend-seat", recommendSeat);
router.post("/chat", chatbot);

module.exports = router;
