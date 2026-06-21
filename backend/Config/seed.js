const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Train = require("../Models/Train");
const User = require("../Models/User");

const trains = [
  {
    trainNumber: "12952", trainName: "Mumbai Rajdhani Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Mumbai Central", destinationCode: "MMCT",
    departureTime: "16:25", arrivalTime: "08:05", duration: "15h 40m", totalDistance: 1384,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Rajdhani",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 18, fare: 4800 },
      { type: "2A", totalSeats: 48, availableSeats: 36, fare: 3200 },
      { type: "3A", totalSeats: 64, availableSeats: 50, fare: 2200 },
    ],
  },
  {
    trainNumber: "12301", trainName: "Howrah Rajdhani Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Howrah", destinationCode: "HWH",
    departureTime: "16:55", arrivalTime: "09:55", duration: "17h 00m", totalDistance: 1450,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Rajdhani",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 10, fare: 4500 },
      { type: "2A", totalSeats: 48, availableSeats: 28, fare: 2900 },
      { type: "3A", totalSeats: 64, availableSeats: 44, fare: 2050 },
    ],
  },
  {
    trainNumber: "12904", trainName: "Golden Temple Mail",
    source: "Amritsar", sourceCode: "ASR", destination: "Mumbai Central", destinationCode: "MMCT",
    departureTime: "11:30", arrivalTime: "04:45", duration: "17h 15m", totalDistance: 1930,
    daysOfOperation: ["Mon","Wed","Fri"], trainType: "Superfast",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 20, fare: 1950 },
      { type: "3A", totalSeats: 64, availableSeats: 45, fare: 1350 },
      { type: "SL", totalSeats: 320, availableSeats: 180, fare: 520 },
    ],
  },
  {
    trainNumber: "12627", trainName: "Karnataka Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Bangalore", destinationCode: "SBC",
    departureTime: "21:30", arrivalTime: "06:15", duration: "32h 45m", totalDistance: 2444,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Superfast",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 14, fare: 2150 },
      { type: "3A", totalSeats: 64, availableSeats: 38, fare: 1500 },
      { type: "SL", totalSeats: 320, availableSeats: 210, fare: 580 },
      { type: "2S", totalSeats: 200, availableSeats: 140, fare: 220 },
    ],
  },
  {
    trainNumber: "12691", trainName: "Chennai Rajdhani Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Chennai Central", destinationCode: "MAS",
    departureTime: "22:30", arrivalTime: "07:25", duration: "32h 55m", totalDistance: 2175,
    daysOfOperation: ["Tue","Thu","Sat"], trainType: "Rajdhani",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 8, fare: 5200 },
      { type: "2A", totalSeats: 48, availableSeats: 22, fare: 3500 },
      { type: "3A", totalSeats: 64, availableSeats: 48, fare: 2400 },
    ],
  },
  {
    trainNumber: "22691", trainName: "Rajdhani Express (Bengaluru)",
    source: "New Delhi", sourceCode: "NDLS", destination: "Bangalore", destinationCode: "SBC",
    departureTime: "20:10", arrivalTime: "11:25", duration: "15h 15m", totalDistance: 2150,
    daysOfOperation: ["Mon","Wed","Fri"], trainType: "Rajdhani",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 6, fare: 5100 },
      { type: "2A", totalSeats: 48, availableSeats: 0, fare: 3100 },
      { type: "3A", totalSeats: 64, availableSeats: 12, fare: 2050 },
    ],
  },
  {
    trainNumber: "12002", trainName: "New Delhi Bhopal Shatabdi",
    source: "New Delhi", sourceCode: "NDLS", destination: "Bhopal", destinationCode: "BPL",
    departureTime: "06:00", arrivalTime: "13:55", duration: "7h 55m", totalDistance: 702,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat"], trainType: "Shatabdi",
    classes: [
      { type: "CC", totalSeats: 120, availableSeats: 75, fare: 1050 },
      { type: "EC", totalSeats: 60, availableSeats: 30, fare: 1850 },
    ],
  },
  {
    trainNumber: "22439", trainName: "New Delhi Vande Bharat Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Varanasi", destinationCode: "BSB",
    departureTime: "06:00", arrivalTime: "14:00", duration: "8h 00m", totalDistance: 759,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Vande Bharat",
    classes: [
      { type: "CC", totalSeats: 120, availableSeats: 60, fare: 1490 },
      { type: "EC", totalSeats: 60, availableSeats: 20, fare: 2750 },
    ],
  },
  {
    trainNumber: "12259", trainName: "Sealdah Duronto Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Sealdah", destinationCode: "SDAH",
    departureTime: "20:10", arrivalTime: "12:20", duration: "16h 10m", totalDistance: 1453,
    daysOfOperation: ["Mon","Thu"], trainType: "Duronto",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 12, fare: 4200 },
      { type: "2A", totalSeats: 48, availableSeats: 30, fare: 2800 },
      { type: "3A", totalSeats: 64, availableSeats: 52, fare: 1900 },
    ],
  },
  {
    trainNumber: "12650", trainName: "Karnataka Sampark Kranti",
    source: "Hazrat Nizamuddin", sourceCode: "NZM", destination: "Bangalore", destinationCode: "SBC",
    departureTime: "20:35", arrivalTime: "06:30", duration: "33h 55m", totalDistance: 2444,
    daysOfOperation: ["Tue","Fri"], trainType: "Superfast",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 22, fare: 1600 },
      { type: "SL", totalSeats: 320, availableSeats: 160, fare: 620 },
      { type: "2S", totalSeats: 200, availableSeats: 120, fare: 230 },
    ],
  },
  {
    trainNumber: "11057", trainName: "Devagiri Express",
    source: "Mumbai", sourceCode: "CSTM", destination: "Manmad", destinationCode: "MMR",
    departureTime: "21:05", arrivalTime: "06:50", duration: "9h 45m", totalDistance: 328,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Express",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 40, fare: 780 },
      { type: "SL", totalSeats: 320, availableSeats: 240, fare: 285 },
      { type: "2S", totalSeats: 200, availableSeats: 150, fare: 120 },
    ],
  },
  {
    trainNumber: "12562", trainName: "Swatantrata Senani SF Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Patna", destinationCode: "PNBE",
    departureTime: "19:15", arrivalTime: "08:30", duration: "13h 15m", totalDistance: 1001,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Superfast",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 16, fare: 1600 },
      { type: "3A", totalSeats: 64, availableSeats: 38, fare: 1100 },
      { type: "SL", totalSeats: 320, availableSeats: 200, fare: 420 },
    ],
  },
  {
    trainNumber: "19032", trainName: "Haridwar Express",
    source: "Mumbai", sourceCode: "BDTS", destination: "Haridwar", destinationCode: "HW",
    departureTime: "11:30", arrivalTime: "20:45", duration: "33h 15m", totalDistance: 1521,
    daysOfOperation: ["Mon","Thu"], trainType: "Express",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 28, fare: 1250 },
      { type: "SL", totalSeats: 320, availableSeats: 180, fare: 480 },
      { type: "2S", totalSeats: 200, availableSeats: 100, fare: 185 },
    ],
  },
  {
    trainNumber: "12025", trainName: "Pune Shatabdi Express",
    source: "Mumbai", sourceCode: "CSTM", destination: "Pune", destinationCode: "PUNE",
    departureTime: "07:10", arrivalTime: "10:40", duration: "3h 30m", totalDistance: 191,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat"], trainType: "Shatabdi",
    classes: [
      { type: "CC", totalSeats: 120, availableSeats: 80, fare: 510 },
      { type: "EC", totalSeats: 60, availableSeats: 25, fare: 960 },
    ],
  },
  {
    trainNumber: "12723", trainName: "Telangana Express",
    source: "Hyderabad", sourceCode: "HYB", destination: "New Delhi", destinationCode: "NDLS",
    departureTime: "06:25", arrivalTime: "07:15", duration: "24h 50m", totalDistance: 1661,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Superfast",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 18, fare: 2200 },
      { type: "3A", totalSeats: 64, availableSeats: 42, fare: 1540 },
      { type: "SL", totalSeats: 320, availableSeats: 200, fare: 590 },
    ],
  },
  {
    trainNumber: "12649", trainName: "Sampark Kranti Express",
    source: "Bangalore", sourceCode: "SBC", destination: "Hyderabad", destinationCode: "HYB",
    departureTime: "20:00", arrivalTime: "07:30", duration: "11h 30m", totalDistance: 561,
    daysOfOperation: ["Mon","Wed","Fri","Sun"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 20, fare: 1450 },
      { type: "3A", totalSeats: 64, availableSeats: 40, fare: 980 },
      { type: "SL", totalSeats: 320, availableSeats: 220, fare: 380 },
    ],
  },
  {
    trainNumber: "12986", trainName: "Ajmer Jaipur SF Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Jaipur", destinationCode: "JP",
    departureTime: "15:50", arrivalTime: "20:50", duration: "5h 00m", totalDistance: 308,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Superfast",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 26, fare: 980 },
      { type: "3A", totalSeats: 64, availableSeats: 48, fare: 650 },
      { type: "CC", totalSeats: 120, availableSeats: 70, fare: 450 },
    ],
  },
  {
    trainNumber: "12958", trainName: "Ahmedabad Mumbai Duronto",
    source: "Ahmedabad", sourceCode: "ADI", destination: "Mumbai Central", destinationCode: "MMCT",
    departureTime: "23:15", arrivalTime: "06:00", duration: "6h 45m", totalDistance: 491,
    daysOfOperation: ["Mon","Tue","Thu","Fri","Sun"], trainType: "Duronto",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 10, fare: 2400 },
      { type: "2A", totalSeats: 48, availableSeats: 28, fare: 1650 },
      { type: "3A", totalSeats: 64, availableSeats: 45, fare: 1150 },
    ],
  },
  {
    trainNumber: "12230", trainName: "Lucknow Mail",
    source: "New Delhi", sourceCode: "NDLS", destination: "Lucknow", destinationCode: "LKO",
    departureTime: "22:05", arrivalTime: "06:15", duration: "8h 10m", totalDistance: 497,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 22, fare: 1100 },
      { type: "3A", totalSeats: 64, availableSeats: 44, fare: 760 },
      { type: "SL", totalSeats: 320, availableSeats: 230, fare: 290 },
    ],
  },
  {
    trainNumber: "12839", trainName: "Howrah Chennai Mail",
    source: "Howrah", sourceCode: "HWH", destination: "Chennai Central", destinationCode: "MAS",
    departureTime: "23:50", arrivalTime: "05:40", duration: "29h 50m", totalDistance: 1662,
    daysOfOperation: ["Tue","Thu","Sat"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 18, fare: 2050 },
      { type: "3A", totalSeats: 64, availableSeats: 40, fare: 1420 },
      { type: "SL", totalSeats: 320, availableSeats: 190, fare: 550 },
    ],
  },
  {
    trainNumber: "12413", trainName: "Amritsar Shatabdi Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Amritsar", destinationCode: "ASR",
    departureTime: "07:20", arrivalTime: "13:25", duration: "6h 05m", totalDistance: 449,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Shatabdi",
    classes: [
      { type: "CC", totalSeats: 120, availableSeats: 65, fare: 870 },
      { type: "EC", totalSeats: 60, availableSeats: 22, fare: 1620 },
    ],
  },
  {
    trainNumber: "12010", trainName: "Mumbai Pune Shatabdi Vistara",
    source: "Mumbai Central", sourceCode: "MMCT", destination: "New Delhi", destinationCode: "NDLS",
    departureTime: "17:00", arrivalTime: "09:35", duration: "16h 35m", totalDistance: 1384,
    daysOfOperation: ["Tue","Thu","Sat"], trainType: "Rajdhani",
    classes: [
      { type: "1A", totalSeats: 24, availableSeats: 14, fare: 4750 },
      { type: "2A", totalSeats: 48, availableSeats: 32, fare: 3150 },
      { type: "3A", totalSeats: 64, availableSeats: 55, fare: 2180 },
    ],
  },
  {
    trainNumber: "20502", trainName: "New Delhi Hyderabad Humsafar",
    source: "New Delhi", sourceCode: "NDLS", destination: "Hyderabad", destinationCode: "HYB",
    departureTime: "11:50", arrivalTime: "13:10", duration: "25h 20m", totalDistance: 1665,
    daysOfOperation: ["Wed","Sat"], trainType: "Superfast",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 36, fare: 1680 },
    ],
  },
  {
    trainNumber: "22692", trainName: "Bangalore Howrah Express",
    source: "Bangalore", sourceCode: "SBC", destination: "Howrah", destinationCode: "HWH",
    departureTime: "08:15", arrivalTime: "13:30", duration: "29h 15m", totalDistance: 1871,
    daysOfOperation: ["Mon","Fri"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 16, fare: 2250 },
      { type: "3A", totalSeats: 64, availableSeats: 36, fare: 1550 },
      { type: "SL", totalSeats: 320, availableSeats: 180, fare: 590 },
    ],
  },
  {
    trainNumber: "14723", trainName: "Dibai Bhopal Express",
    source: "Dibai", sourceCode: "DIB", destination: "Bhopal", destinationCode: "BPL",
    departureTime: "09:40", arrivalTime: "22:30", duration: "12h 50m", totalDistance: 612,
    daysOfOperation: ["Mon","Wed","Fri"], trainType: "Express",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 30, fare: 890 },
      { type: "SL", totalSeats: 320, availableSeats: 200, fare: 340 },
      { type: "2S", totalSeats: 200, availableSeats: 130, fare: 150 },
    ],
  },
  {
    trainNumber: "14724", trainName: "Bhopal Dibai Express",
    source: "Bhopal", sourceCode: "BPL", destination: "Dibai", destinationCode: "DIB",
    departureTime: "06:15", arrivalTime: "19:05", duration: "12h 50m", totalDistance: 612,
    daysOfOperation: ["Tue","Thu","Sat"], trainType: "Express",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 32, fare: 890 },
      { type: "SL", totalSeats: 320, availableSeats: 205, fare: 340 },
      { type: "2S", totalSeats: 200, availableSeats: 135, fare: 150 },
    ],
  },
  {
    trainNumber: "11271", trainName: "Mathura Bhopal Express",
    source: "Mathura", sourceCode: "MTJ", destination: "Bhopal", destinationCode: "BPL",
    departureTime: "13:20", arrivalTime: "23:45", duration: "10h 25m", totalDistance: 490,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 18, fare: 1280 },
      { type: "3A", totalSeats: 64, availableSeats: 38, fare: 880 },
      { type: "SL", totalSeats: 320, availableSeats: 210, fare: 330 },
    ],
  },
  {
    trainNumber: "11272", trainName: "Bhopal Mathura Express",
    source: "Bhopal", sourceCode: "BPL", destination: "Mathura", destinationCode: "MTJ",
    departureTime: "05:30", arrivalTime: "15:50", duration: "10h 20m", totalDistance: 490,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 20, fare: 1280 },
      { type: "3A", totalSeats: 64, availableSeats: 40, fare: 880 },
      { type: "SL", totalSeats: 320, availableSeats: 215, fare: 330 },
    ],
  },
  {
    trainNumber: "14041", trainName: "Delhi Haridwar Express",
    source: "New Delhi", sourceCode: "NDLS", destination: "Haridwar", destinationCode: "HW",
    departureTime: "07:00", arrivalTime: "11:45", duration: "4h 45m", totalDistance: 222,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Express",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 35, fare: 480 },
      { type: "SL", totalSeats: 320, availableSeats: 210, fare: 190 },
      { type: "2S", totalSeats: 200, availableSeats: 140, fare: 95 },
    ],
  },
  {
    trainNumber: "14042", trainName: "Haridwar Delhi Express",
    source: "Haridwar", sourceCode: "HW", destination: "New Delhi", destinationCode: "NDLS",
    departureTime: "16:30", arrivalTime: "21:15", duration: "4h 45m", totalDistance: 222,
    daysOfOperation: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], trainType: "Express",
    classes: [
      { type: "3A", totalSeats: 64, availableSeats: 38, fare: 480 },
      { type: "SL", totalSeats: 320, availableSeats: 215, fare: 190 },
      { type: "2S", totalSeats: 200, availableSeats: 145, fare: 95 },
    ],
  },
  {
    trainNumber: "12651", trainName: "Hyderabad Bangalore Sampark Kranti",
    source: "Hyderabad", sourceCode: "HYB", destination: "Bangalore", destinationCode: "SBC",
    departureTime: "21:15", arrivalTime: "08:45", duration: "11h 30m", totalDistance: 561,
    daysOfOperation: ["Tue","Thu","Sat"], trainType: "Express",
    classes: [
      { type: "2A", totalSeats: 48, availableSeats: 22, fare: 1450 },
      { type: "3A", totalSeats: 64, availableSeats: 42, fare: 980 },
      { type: "SL", totalSeats: 320, availableSeats: 225, fare: 380 },
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Train.deleteMany({});
    await User.deleteMany({ role: "admin" });
    console.log("🧹 Cleared existing trains");

    // Seed trains
    await Train.insertMany(trains);
    console.log(`🚂 Inserted ${trains.length} trains`);

    // Fix #4 — seed an admin user automatically
    const admin = await User.create({
      name: "Admin User",
      email: "admin@railride.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log(`👤 Admin created — email: admin@railride.com | password: Admin@123`);

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedDB();
