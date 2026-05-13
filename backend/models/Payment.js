const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'paypal', 'stripe', 'bank_transfer'],
    required: true
  },
  paymentId: {
    type: String, // Gateway payment ID
    required: true
  },
  orderId: {
    type: String, // Gateway order ID
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed // Raw response from payment gateway
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Additional metadata
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ application: 1 });
paymentSchema.index({ university: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: 1 });

// Static methods
paymentSchema.statics.createPaymentOrder = async function(paymentData) {
  const payment = new this(paymentData);
  return payment.save();
};

paymentSchema.statics.findByPaymentId = function(paymentId) {
  return this.findOne({ paymentId }).populate('user application university');
};

paymentSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId }).populate('user application university');
};

paymentSchema.statics.getUserPayments = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  return this.find(query).populate('application university').sort({ createdAt: -1 });
};

paymentSchema.statics.getUniversityPayments = function(universityId, status = null) {
  const query = { university: universityId };
  if (status) query.status = status;
  return this.find(query).populate('user application').sort({ createdAt: -1 });
};

// Instance methods
paymentSchema.methods.markAsCompleted = function(gatewayResponse = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

paymentSchema.methods.markAsFailed = function(gatewayResponse = null) {
  this.status = 'failed';
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

paymentSchema.methods.processRefund = function(refundAmount, refundReason) {
  this.status = 'refunded';
  this.refundAmount = refundAmount;
  this.refundReason = refundReason;
  this.refundedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
