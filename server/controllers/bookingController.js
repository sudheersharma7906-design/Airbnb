const Booking = require('../models/Booking');
const Property = require('../models/Property');

const checkAvailability = async (propertyId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    propertyId,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(filter);
  return !conflict;
};

const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const available = await checkAvailability(propertyId, checkIn, checkOut);
    if (!available) {
      return res.status(400).json({ message: 'Property not available for selected dates' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;

    const booking = await Booking.create({
      userId: req.user._id,
      propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests) || 1,
      totalPrice,
      status: 'confirmed',
    });

    const populated = await Booking.findById(booking._id)
      .populate('propertyId', 'title location images price')
      .populate('userId', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('propertyId', 'title location images price hostId')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyBookings = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ propertyId: req.params.propertyId })
      .populate('userId', 'name email')
      .sort({ checkIn: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const property = await Property.findById(booking.propertyId);
    const isHost = property?.hostId.toString() === req.user._id.toString();

    if (!isOwner && !isHost) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkPropertyAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const available = await checkAvailability(req.params.propertyId, checkIn, checkOut);
    res.json({ available });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const available = await checkAvailability(propertyId, checkIn, checkOut);
    if (!available) {
      return res.status(400).json({ message: 'Property not available for selected dates' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;

    const useRazorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    let order = null;

    if (useRazorpay) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      order = await razorpay.orders.create({
        amount: totalPrice * 100,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
    } else {
      order = {
        id: `order_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`,
        amount: totalPrice * 100,
        currency: 'INR',
        mock: true,
      };
    }

    res.json({
      order,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey',
      totalPrice,
      nights,
      propertyTitle: property.title,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    } = req.body;

    const isMock = razorpay_order_id.startsWith('order_mock_');

    if (!isMock) {
      const crypto = require('crypto');
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const booking = await Booking.create({
      userId: req.user._id,
      propertyId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: Number(guests),
      totalPrice: Number(totalPrice),
      status: 'confirmed',
    });

    const populated = await Booking.findById(booking._id)
      .populate('propertyId', 'title location price images')
      .populate('userId', 'name email');

    const { sendBookingConfirmation } = require('../utils/emailService');
    await sendBookingConfirmation(req.user.email, req.user.name, populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  cancelBooking,
  checkPropertyAvailability,
  createRazorpayOrder,
  verifyPayment,
};

