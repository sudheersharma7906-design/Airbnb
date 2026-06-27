require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const path = require('path');
const fs = require('fs');
console.log('__dirname:', __dirname);
try {
  console.log('Files in ../client:', fs.readdirSync(path.join(__dirname, '../client')));
} catch (e) {
  console.error('Error listing ../client:', e.message);
}
try {
  console.log('Files in ../client/dist:', fs.readdirSync(path.join(__dirname, '../client/dist')));
} catch (e) {
  console.error('Error listing ../client/dist:', e.message);
}
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');

const app = express();
app.set('trust proxy', 1);

// Global Rate Limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Configure Helmet to set secure HTTP headers with custom CSP rules
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://checkout.razorpay.com"],
        "img-src": [
          "'self'", 
          "data:", 
          "blob:", 
          "https://res.cloudinary.com", 
          "https://*.cloudinary.com", 
          "https://*.tile.openstreetmap.org", 
          "https://unpkg.com", 
          "https://cdnjs.cloudflare.com",
          "https://checkout.razorpay.com"
        ],
        "connect-src": [
          "'self'", 
          "ws:", 
          "wss:", 
          "http://localhost:5000", 
          "http://localhost:5173", 
          "http://127.0.0.1:5000", 
          "https://api.razorpay.com"
        ],
        "frame-src": ["'self'", "https://api.razorpay.com", "https://*.razorpay.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 1. Pre-shadow Express 5 query getter to make it mutable for subsequent middlewares
app.use((req, res, next) => {
  if (req.query) {
    const mutableQuery = { ...req.query };
    Object.defineProperty(req, 'query', {
      value: mutableQuery,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
});

// 2. Protect against HTTP Parameter Pollution (HPP)
app.use(hpp());

// 3. Sanitize inputs to prevent MongoDB Operator Injection (compatible with Express 5)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - NODE_ENV=${process.env.NODE_ENV}`);
  next();
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Airbnb Clone API running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error('SERVER ERROR Handler:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  socket.on('send_message', async (data) => {
    const { senderId, receiverId, message } = data;
    if (!senderId || !receiverId || !message) return;

    try {
      const savedMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      io.to(receiverId.toString()).emit('receive_message', savedMessage);
      io.to(senderId.toString()).emit('receive_message', savedMessage);

      io.to(receiverId.toString()).emit('notification', {
        type: 'message',
        title: 'New Message',
        content: message.length > 30 ? message.substring(0, 30) + '...' : message,
        senderId,
      });
    } catch (err) {
      console.error('Socket message error:', err.message);
    }
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined!');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

