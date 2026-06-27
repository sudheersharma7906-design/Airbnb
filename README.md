# 🏡 Nestfinder - Premium MERN Airbnb Clone

Nestfinder is a premium-grade stay-booking web application built using the MERN stack (MongoDB, Express, React, Node.js). Designed with a modern, glassmorphic UI matching the current Airbnb aesthetic, Nestfinder features real-time Socket.io chat messaging, Leaflet-based exact geo-tagging, mock and verified Razorpay payment integration, star rating reviews, visual alert notifications, and AI-powered stay recommendations.

---

## ✨ Features Checklist

### 👤 Guest/User side
* **JWT Authentication**: Secure register, login, logout, and token authorization.
* **Modern stays header search**: Floating pill search filter (Destination City, Price Range, Guest capacity, and Star ratings).
* **Category Filters**: Quick-tabs (Beachfront, Cabins, Penthouses, Heritage, Houseboats) to filter stays.
* **Interactive Image Galleries**: High-end details page with 5-photo grid layout.
* **Exact Geo-Tagging**: Live Leaflet OpenStreetMap pinning exact coordinate values of stays.
* **Mock/Verified Razorpay checkout**: Automated nights fee calculations with sandboxed simulated overlay.
* **Traveler Ticket passes**: Trip history categorized into Upcoming, Past, and Cancelled stays styled as flight tickets.
* **Direct Host Messenger**: Instantly chat with hosts from any stay listing page.
* **AI Recommendations**: Suggestions of similar stays based on location and price brackets.
* **Stays Reviews ⭐**: Leave star ratings and text reviews, dynamically recalculating the stay's average rating.

### 🏡 Host Side
* **Metric Dashboards**: Summary panels displaying Active Listings, Total Bookings, and Total Revenue.
* **Listing CRUD**: Add, edit, update price, and delete listings with multi-image upload drag-and-drop zones.
* **Coordinate Tagging Map**: Click and drag interactive pins on a map when listing to set exact stay coordinates.
* **Upcoming Guests**: Scrollable reservations timeline showing traveler dates and stay selections.

### ⚙️ Advanced Features
* **Socket.io Real-time Chat**: Double-socket rooms connecting guests and hosts immediately.
* **Host Chat Emulator**: Triggers automated, context-aware replies from hosts to guests (regarding checkout times, price values, internet speeds, etc.) for standalone testing.
* **Nodemailer Services**: Sends HTML receipt emails to guests upon booking confirmations.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS v4, React Router DOM, Socket.io-client, Lucide-React, Axios.
* **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB), Razorpay SDK, Nodemailer, Bcryptjs, JWT, Multer.
* **Mapping**: Leaflet API (OpenStreetMap, no API keys required).

---

## 📁 Project Structure

```
airbnb-clone/
│
├── client/                     # React Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, PropertyCard, SearchFilters, Footer
│   │   ├── context/            # AuthContext (includes Socket.io initialization)
│   │   ├── pages/              # Home, Detail, Wishlist, Inbox, Trips, Dashboard, Forms
│   │   └── utils/              # api.js Axios helper
│   ├── index.html              # Custom fonts, Razorpay & Leaflet CDN imports
│   └── vite.config.js          # API & upload proxy mapping
│
├── server/                     # Node Express Backend
│   ├── models/                 # User, Property, Booking, Review, Message Schemas
│   ├── controllers/            # Auth, Property, Booking, Review, Chat actions
│   ├── routes/                 # Express API Routing
│   ├── middleware/             # JWT protect and Multer upload filters
│   ├── utils/                  # generateToken, emailService
│   ├── scripts/                # seed.js database seeder
│   └── server.js               # Entry point (Socket.io mounting)
│
└── uploads/                    # Local uploads directory for stay imagery
```

---

## 🚀 Local Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed locally.
* A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas cluster).

### 1. Clone the project and install dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/nestfinder.git
cd airbnb-clone

# Install root, server and client dependencies concurrently
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/airbnb-clone
JWT_SECRET=airbnb-clone-dev-secret-key-2024
CLIENT_URL=http://localhost:5173

# Optional: Add Razorpay keys for real payments (defaults to Simulated Sandbox if omitted)
# RAZORPAY_KEY_ID=your_key_id
# RAZORPAY_KEY_SECRET=your_key_secret

# Optional: Add Nodemailer SMTP details for actual booking emails (defaults to Ethereal/Console)
# EMAIL_HOST=smtp.mailtrap.io
# EMAIL_PORT=2525
# EMAIL_USER=your_smtp_user
# EMAIL_PASS=your_smtp_pass
```

### 3. Seed the Database
Populate Mongoose with beautiful destinations (Goa, Manali, Noida, Kerala, Jaipur) complete with Unsplash imagery, coordinate coordinates, reviews, and test users:
```bash
cd server
node scripts/seed.js
```

### 4. Run the Web Application
```bash
# Start concurrently from the root directory
npm run dev
```

Your Vite frontend will be live on **[http://localhost:5173](http://localhost:5173)** and the Express server on **[http://localhost:5000](http://localhost:5000)**.

---

## 🔑 Test Credentials

* **Traveler / Guest Account**:
  * **Email**: `guest@example.com`
  * **Password**: `password123`
* **Host Account**:
  * **Email**: `host@example.com`
  * **Password**: `password123`

---

## 📬 Contact & Support

For queries or suggestions regarding the Nestfinder clone project, feel free to reach out:

* **Email**: [sudheersharma7906@gmail.com](mailto:sudheersharma7906@gmail.com)
* **Mobile**: [+91 9616290104](tel:+919616290104)
* **Location**: Noida, Uttar Pradesh, India
