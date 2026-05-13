const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Create index for efficient queries
passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ email: 1 });
passwordResetSchema.index({ expiresAt: 1 });

// Method to generate reset token
passwordResetSchema.statics.generateResetToken = async function(email, ipAddress, userAgent) {
  // Invalidate any existing tokens for this email
  await this.deleteMany({ email, isUsed: false });
  
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Create new reset token document
  const resetToken = await this.create({
    email,
    token,
    ipAddress,
    userAgent,
    expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
  });
  
  return resetToken;
};

// Method to validate reset token
passwordResetSchema.statics.validateToken = async function(token) {
  const resetDoc = await this.findOne({ 
    token, 
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('user');
  
  if (!resetDoc) {
    return null;
  }
  
  return resetDoc;
};

// Method to mark token as used
passwordResetSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  return this.save();
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
