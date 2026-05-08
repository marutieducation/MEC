const express = require('express');
const router = express.Router();
const { getDashboard, completeProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('student'), getDashboard);
router.put('/complete-profile', protect, authorize('student'), completeProfile);

module.exports = router;
