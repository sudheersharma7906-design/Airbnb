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

module.exports = {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  cancelBooking,
  checkPropertyAvailability,
};
