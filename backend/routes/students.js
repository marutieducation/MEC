const express = require('express');
const router = express.Router();
const { getDashboard, completeProfile, bookConsultation, getConsultations, cancelConsultation } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('student'), getDashboard);
router.put('/complete-profile', protect, authorize('student'), completeProfile);
router.post('/book-consultation', protect, authorize('student'), bookConsultation);
router.get('/consultations', protect, authorize('student'), getConsultations);
router.put('/consultations/:id/cancel', protect, authorize('student'), cancelConsultation);

module.exports = router;
