const Groq = require("groq-sdk");

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.warn("⚠️  GROQ_API_KEY is missing");
}

const groq = new Groq({ apiKey: apiKey || "" });
const MODEL = "llama-3.3-70b-versatile";

const parseJSON = (text) => {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

// @route POST /api/ai/plan
const planTrip = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 5)
      return res.status(400).json({ message: "Please provide a more detailed query" });

    const prompt = `You are RailRide AI, an Indian railway assistant.
User says: "${query}"
Today: ${new Date().toISOString().split("T")[0]}

Extract travel intent and respond ONLY with valid JSON (no markdown, no backticks):
{
  "from": "city name",
  "fromCode": "station code like NDLS",
  "to": "city name",
  "toCode": "station code like MMCT",
  "date": "YYYY-MM-DD or null",
  "passengers": 1,
  "preferredClass": "SL/3A/2A/1A/CC or null",
  "budgetPerPerson": number or null,
  "tip": "one helpful tip for this route in plain English",
  "understood": true
}
If travel intent is unclear, set "understood": false and add "error": "reason".`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;
    const parsed = parseJSON(text);
    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError)
      return res.status(502).json({ message: "AI returned unexpected format. Please try again." });
    res.status(500).json({ message: "AI service error", detail: err.message });
  }
};

// @route POST /api/ai/recommend-seat
const recommendSeat = async (req, res) => {
  try {
    const { journeyHours, budget, travelPurpose, groupSize, availableClasses } = req.body;
    if (!journeyHours || !budget)
      return res.status(400).json({ message: "journeyHours and budget are required" });

    const prompt = `You are a railway seat advisor for Indian Railways.
Journey: ${journeyHours}h, Budget: ₹${budget}/person, Purpose: ${travelPurpose || "general"}, Group: ${groupSize || 1}
${availableClasses ? `Available classes: ${availableClasses}` : ""}

Respond ONLY with valid JSON:
{
  "recommended": "class type (SL/3A/2A/1A/CC)",
  "reason": "2-sentence explanation",
  "alternative": "second-best class",
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    res.json(parseJSON(completion.choices[0].message.content));
  } catch (err) {
    if (err instanceof SyntaxError)
      return res.status(502).json({ message: "AI returned unexpected format. Please try again." });
    res.status(500).json({ message: "AI recommendation failed", detail: err.message });
  }
};

// @route POST /api/ai/chat
const chatbot = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || message.trim().length === 0)
      return res.status(400).json({ message: "Message cannot be empty" });
    if (message.length > 500)
      return res.status(400).json({ message: "Message too long (max 500 characters)" });

    const messages = [
      {
        role: "system",
        content:
          "You are RailRide AI. Answer Indian railway questions concisely (under 100 words). Use emojis. Help with: train search, PNR, fares, cancellation, booking tips.",
      },
      ...history.slice(-8).map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: "Chatbot error", detail: err.message });
  }
};

module.exports = { planTrip, recommendSeat, chatbot };