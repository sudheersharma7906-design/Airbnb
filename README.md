# 🏡 Nestfinder — Premium Airbnb-Style Stay Booking App

> A full-stack, production-grade stay-booking platform built on the **MERN stack**, featuring real-time chat, interactive maps, AI-powered recommendations, and a seamless payment experience.

---

## ✨ Feature Highlights

### 👤 Guest / Traveler

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure register, login, logout, and route protection |
| 🔍 Smart Search | Floating pill filter by destination, price range, guest count, and star rating |
| 🏷️ Category Tabs | One-click filters: Beachfront · Cabins · Penthouses · Heritage · Houseboats |
| 🖼️ Image Galleries | 5-photo grid layout on every stay detail page |
| 🗺️ Exact Geo-Tagging | Live Leaflet/OpenStreetMap pin with precise coordinates |
| 💳 Razorpay Checkout | Automated nightly fee calculation with sandboxed payment overlay |
| 🎫 Trip Tickets | Flight-ticket–styled history split into Upcoming, Past, and Cancelled |
| 💬 Direct Messaging | Instant in-app chat with hosts from any listing page |
| 🤖 AI Recommendations | Similar stay suggestions based on location and price bracket |
| ⭐ Reviews | Star ratings + text reviews with live average recalculation |

### 🏡 Host

| Feature | Description |
|---|---|
| 📊 Metric Dashboard | Panels for Active Listings, Total Bookings, and Total Revenue |
| 📝 Listing CRUD | Add, edit, update pricing, and delete listings |
| 📸 Image Upload | Drag-and-drop multi-image upload zones |
| 📍 Coordinate Tagging | Click-and-drag map pin to set exact stay coordinates |
| 📅 Guest Timeline | Scrollable reservations view with traveler dates and selections |

### ⚙️ Advanced / Technical

- **Socket.io Real-time Chat** — Dual-socket rooms connecting guests and hosts instantly
- **Host Chat Emulator** — Automated, context-aware host replies for standalone testing
- **Nodemailer** — HTML receipt emails sent to guests on booking confirmation

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS v4, React Router DOM, Socket.io-client, Lucide React, Axios |
| **Backend** | Node.js, Express, Socket.io, Mongoose (MongoDB), Razorpay SDK, Nodemailer, Bcryptjs, JWT, Multer |
| **Maps** | Leaflet + OpenStreetMap *(no API key required)* |

---

## 📁 Project Structure

```
airbnb-clone/
│
├── client/                     # React Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, PropertyCard, SearchFilters, Footer
│   │   ├── context/            # AuthContext (Socket.io initialisation)
│   │   ├── pages/              # Home, Detail, Wishlist, Inbox, Trips, Dashboard, Forms
│   │   └── utils/              # api.js Axios helper
│   ├── index.html              # Fonts, Razorpay & Leaflet CDN imports
│   └── vite.config.js          # API & upload proxy mapping
│
├── server/                     # Node + Express Backend
│   ├── models/                 # User, Property, Booking, Review, Message schemas
│   ├── controllers/            # Auth, Property, Booking, Review, Chat handlers
│   ├── routes/                 # Express API routing
│   ├── middleware/             # JWT protect, Multer upload filter
│   ├── utils/                  # generateToken, emailService
│   ├── scripts/                # seed.js database seeder
│   └── server.js               # Entry point (Socket.io mounting)
│
└── uploads/                    # Local stay imagery directory
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)

### 1 · Clone & Install

```bash
git clone https://github.com/your-username/nestfinder.git
cd airbnb-clone
npm run install-all          # installs root, server, and client deps concurrently
```

### 2 · Configure Environment Variables

Create a `.env` file inside the `server/` directory using the template below:

```env
# ── Server ─────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database ───────────────────────────────────────
MONGO_URI=your_mongodb_connection_string

# ── Auth ───────────────────────────────────────────
JWT_SECRET=your_jwt_secret_key

# ── Razorpay (sandbox) ─────────────────────────────
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ── Nodemailer ─────────────────────────────────────
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> ⚠️ **Never commit your `.env` file.** Add it to `.gitignore`.

### 3 · Seed the Database

Populates MongoDB with destinations (Goa, Manali, Noida, Kerala, Jaipur), Unsplash imagery, coordinates, reviews, and test users:

```bash
cd server
node scripts/seed.js
```

### 4 · Run the App

```bash
npm run dev          # starts frontend + backend concurrently from the root
```

| Service | URL |
|---|---|
| React frontend | <http://localhost:5173> |
| Express API | <http://localhost:5000> |

---

## 🔑 Demo Credentials

> These accounts are created by the seed script and are for **local testing only**.

| Role | Email | Password |
|---|---|---|
| Guest / Traveler | `guest@example.com` | `password123` |
| Host | `host@example.com` | `password123` |

---

## 📬 Contact & Support

Feel free to open an issue or reach out with questions and feedback.

- **GitHub Issues**: Preferred channel for bug reports and feature requests
- **Email**: *Available on request — see project maintainer profile*

---

## 📄 License

This project is released for educational and portfolio purposes. See `LICENSE` for details.
