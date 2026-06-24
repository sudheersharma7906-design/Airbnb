const express = require('express');
const {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  cancelBooking,
  checkPropertyAvailability,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/property/:propertyId', protect, authorize('host', 'admin'), getPropertyBookings);
router.get('/availability/:propertyId', checkPropertyAvailability);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
