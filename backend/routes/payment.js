const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  getUserPayments,
  processRefund
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validation');

// Payment routes
router.post('/create-order', protect, paymentLimiter, validate('paymentOrder'), createPaymentOrder);
router.post('/verify', protect, paymentLimiter, validate('verifyPayment'), verifyPayment);
router.get('/status/:paymentId', protect, getPaymentStatus);
router.get('/my-payments', protect, getUserPayments);
router.post('/refund', protect, paymentLimiter, validate('refund'), processRefund);

module.exports = router;
