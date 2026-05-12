const express = require('express');
const router = express.Router();
const { getDashboard, completeProfile, getSavedPrograms } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('student'), getDashboard);
router.put('/complete-profile', protect, authorize('student'), completeProfile);
router.get('/saved-programs', protect, authorize('student'), getSavedPrograms);

module.exports = router;
