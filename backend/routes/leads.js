const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitLead } = require('../controllers/leadController');

// Public lead submission - limit to prevent spam
const submitLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 submissions per 15 minutes per IP
  message: { message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/submit', submitLeadLimiter, submitLead);

module.exports = router;
