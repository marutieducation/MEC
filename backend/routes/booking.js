const express = require('express');
const router = express.Router();
const {
  bookConsultation,
  getStudentBookings,
  getCounsellorBookings,
  getAvailableSlots,
  confirmBooking,
  rescheduleBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validation');

// Public route for getting available slots
router.get('/available-slots', getAvailableSlots);

// Student booking routes
router.post('/book', protect, authorize('student'), strictLimiter, validate('booking'), bookConsultation);
router.get('/my-bookings', protect, authorize('student'), getStudentBookings);
router.post('/reschedule', protect, strictLimiter, rescheduleBooking);
router.post('/cancel', protect, cancelBooking);

// Counsellor booking routes
router.get('/counsellor-bookings', protect, authorize('counsellor', 'admin'), getCounsellorBookings);
router.post('/confirm', protect, authorize('counsellor', 'admin'), strictLimiter, confirmBooking);

module.exports = router;
