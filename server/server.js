require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');

const app = express();
app.set('trust proxy', 1);
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

