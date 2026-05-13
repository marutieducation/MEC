const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    ip: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    success: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
loginAttemptSchema.index({ email: 1, createdAt: 1 });
loginAttemptSchema.index({ ip: 1, createdAt: 1 });

// Method to check if account should be locked
loginAttemptSchema.statics.isAccountLocked = async function(email) {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const failedAttempts = await this.countDocuments({
    email,
    success: false,
    createdAt: { $gte: fifteenMinutesAgo }
  });
  
  return failedAttempts >= 50;
};

// Method to get remaining attempts
loginAttemptSchema.statics.getRemainingAttempts = async function(email) {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const failedAttempts = await this.countDocuments({
    email,
    success: false,
    createdAt: { $gte: fifteenMinutesAgo }
  });
  
  return Math.max(0, 50 - failedAttempts);
};

// Method to clean old attempts (older than 1 hour)
loginAttemptSchema.statics.cleanOldAttempts = async function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await this.deleteMany({ createdAt: { $lt: oneHourAgo } });
};

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
