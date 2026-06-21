# 🚂 RailRide — AI-Powered Railway Booking App

A full-stack MERN application for Indian railway search and ticket booking, with Google Gemini AI integration for natural language trip planning, seat recommendations, and a 24/7 chatbot.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Register / Login with JWT. Admin role via seed. |
| 🔍 **Train Search** | Search by city/station code with date + class filters |
| 📅 **Day Filtering** | Only shows trains that actually run on the selected day |
| 🎫 **Ticket Booking** | Multi-passenger, berth preferences, auto PNR generation |
| 💳 **Mock Payment** | UPI / Card / Netbanking / Wallet payment step |
| ❌ **Cancellation** | Cancel with atomic seat restoration, refund status |
| 📋 **PNR Status** | Lookup booking details by PNR number |
| 🗺️ **AI Trip Planner** | Natural language → parsed train search via Gemini |
| 💺 **AI Seat Advisor** | Recommends best class for your journey |
| 💬 **AI Chatbot** | Floating 24/7 railway assistant on every page |
| 🛡️ **Admin Panel** | Create/edit/delete trains, stats dashboard, search |
| 📱 **Responsive** | Mobile-friendly layout throughout |

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v6, react-hot-toast |
| Backend | Node.js, Express.js, Helmet, Morgan, express-rate-limit |
| Database | MongoDB Atlas + Mongoose (with atomic transactions) |
| Auth | JWT + bcryptjs (httpOnly-ready) |
| Validation | express-validator on all routes |
| AI | Google Gemini 2.0 Flash |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/railride.git
cd railride

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# backend/.env  (copy from .env.example)
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/railride
JWT_SECRET=your_very_long_random_secret_key_here
GEMINI_API_KEY=AIza...your_gemini_api_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

```bash
cd backend
npm run seed
# Creates 15 real trains + admin user (admin@railride.com / Admin@123)
```

### 4. Run Dev Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev   # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev  # → http://localhost:5173
```

---

## 📁 Project Structure

```
railride/
├── .gitignore
├── README.md
│
├── backend/
│   ├── Config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── validateEnv.js     # Startup env check
│   │   └── seed.js            # 15 trains + admin user
│   ├── Controllers/
│   │   ├── authController.js  # Register, Login, Me, Change Password
│   │   ├── trainController.js # Search (with day filter), CRUD
│   │   ├── bookingController.js # Atomic booking + cancellation
│   │   └── aiController.js    # Trip planner, Seat advisor, Chatbot
│   ├── Middleware/
│   │   ├── authMiddleware.js  # JWT protect + adminOnly
│   │   └── validate.js        # express-validator runner
│   ├── Models/
│   │   ├── User.js            # bcrypt hashing, role
│   │   ├── Train.js           # classes, stops, days
│   │   └── Booking.js         # PNR auto-gen, passengers
│   ├── Route/
│   │   ├── authRoutes.js      # POST /register /login, GET /me, PUT /change-password
│   │   ├── trainRoutes.js     # GET /search, CRUD (admin)
│   │   ├── bookingRoutes.js   # POST / GET /my /pnr/:pnr, PUT /:id/cancel
│   │   └── aiRoutes.js        # POST /plan /recommend-seat /chat
│   ├── index.js               # Express app + middleware + rate limiting
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx      # Navy navbar matching screenshot
    │   │   └── AIChatbot.jsx   # Floating chat widget
    │   ├── context/
    │   │   └── AuthContext.jsx # JWT state + loading screen
    │   ├── pages/
    │   │   ├── Home.jsx        # Search + AI Trip Planner bar
    │   │   ├── SearchResults.jsx # Sidebar filters + train cards (with skeletons)
    │   │   ├── BookTrain.jsx   # 4-step: class → passengers → payment → confirm
    │   │   ├── MyBookings.jsx  # All bookings with cancel
    │   │   ├── PNRStatus.jsx   # PNR lookup
    │   │   ├── AIFeatures.jsx  # Trip Planner / Seat Advisor / Chat tabs
    │   │   ├── AdminPanel.jsx  # Stats + create/edit/delete trains
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios instance with interceptors
    │   ├── App.jsx             # Routes + Toaster + 404
    │   ├── index.css           # Navy/orange design system
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🤖 AI Endpoints

| Endpoint | Method | What it does |
|---|---|---|
| `/api/ai/plan` | POST | Parses natural language query → `{ from, to, date, class, budget }` |
| `/api/ai/recommend-seat` | POST | Returns best class for journey params |
| `/api/ai/chat` | POST | Multi-turn railway assistant chatbot |

All AI routes are rate-limited to **20 requests / 15 min** per IP.

---

## 🔐 Security

- **Helmet** — sets secure HTTP headers
- **Rate limiting** — 100 req/15min global, 20/15min on AI, 10/15min on auth
- **Input validation** — `express-validator` on all POST routes
- **Atomic bookings** — MongoDB transactions prevent race conditions on seat reservation
- **JWT** — 7-day tokens, auto-logout on 401 in frontend

---

## 🚢 Deployment

### Backend → Render

1. New Web Service → connect GitHub repo
2. Root directory: `backend`
3. Build: `npm install`
4. Start: `node index.js`
5. Add all env vars in Render dashboard
6. After deploy: `npm run seed` via Render Shell

### Frontend → Vercel

1. New Project → connect GitHub repo
2. Root directory: `frontend`
3. Build: `npm run build`
4. Output: `dist`
5. Add env var: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## 🗝️ Default Credentials (after seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@railride.com | Admin@123 |

---

## 📝 API Reference

### Auth
```
POST /api/auth/register   { name, email, password, phone }
POST /api/auth/login      { email, password }
GET  /api/auth/me         [Auth required]
PUT  /api/auth/change-password  { currentPassword, newPassword } [Auth]
```

### Trains
```
GET  /api/trains/search?from=NDLS&to=MMCT&date=2026-11-12&travelClass=3A
GET  /api/trains/:id
POST /api/trains           [Admin] body: train object
PUT  /api/trains/:id       [Admin]
DEL  /api/trains/:id       [Admin]
```

### Bookings
```
POST /api/bookings         [Auth] { trainId, journeyDate, source, destination, travelClass, passengers[] }
GET  /api/bookings/my      [Auth]
GET  /api/bookings/pnr/:pnr
PUT  /api/bookings/:id/cancel  [Auth]
```

### AI
```
POST /api/ai/plan          { query: "train from delhi to mumbai tomorrow" }
POST /api/ai/recommend-seat { journeyHours, budget, travelPurpose, groupSize }
POST /api/ai/chat          { message, history[] }
```
