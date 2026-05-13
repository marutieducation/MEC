const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true,
    enum: ['10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'pending'
  },
  bookingType: {
    type: String,
    enum: ['initial_consultation', 'application_review', 'interview_prep', 'career_guidance', 'other'],
    default: 'initial_consultation'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  meetingLink: {
    type: String
  },
  meetingId: {
    type: String
  },
  meetingPassword: {
    type: String
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  cancellationReason: {
    type: String,
    maxlength: 300
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      maxlength: 500
    },
    submittedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ student: 1, status: 1 });
bookingSchema.index({ counsellor: 1, status: 1 });
bookingSchema.index({ preferredDate: 1 });
bookingSchema.index({ status: 1 });

// Static methods
bookingSchema.statics.createBooking = async function(bookingData) {
  // Check for conflicting bookings
  const conflictingBooking = await this.findOne({
    counsellor: bookingData.counsellor,
    preferredDate: bookingData.preferredDate,
    preferredTime: bookingData.preferredTime,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (conflictingBooking) {
    throw new Error('This time slot is already booked. Please select a different time.');
  }

  const booking = new this(bookingData);
  return booking.save();
};

bookingSchema.statics.getStudentBookings = function(studentId, status = null) {
  const query = { student: studentId };
  if (status) query.status = status;
  return this.find(query).populate('counsellor', 'firstName lastName email phone').sort({ preferredDate: 1 });
};

bookingSchema.statics.getCounsellorBookings = function(counsellorId, status = null) {
  const query = { counsellor: counsellorId };
  if (status) query.status = status;
  return this.find(query).populate('student', 'firstName lastName email phone').sort({ preferredDate: 1 });
};

bookingSchema.statics.getAvailableSlots = function(counsellorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    counsellor: counsellorId,
    preferredDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['pending', 'confirmed'] }
  }).select('preferredTime');
};

// Instance methods
bookingSchema.methods.confirmBooking = function(meetingDetails = {}) {
  this.status = 'confirmed';
  if (meetingDetails.meetingLink) this.meetingLink = meetingDetails.meetingLink;
  if (meetingDetails.meetingId) this.meetingId = meetingDetails.meetingId;
  if (meetingDetails.meetingPassword) this.meetingPassword = meetingDetails.meetingPassword;
  return this.save();
};

bookingSchema.methods.cancelBooking = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

bookingSchema.methods.completeBooking = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

bookingSchema.methods.rescheduleBooking = function(newDate, newTime) {
  const newBooking = new this.constructor({
    student: this.student,
    counsellor: this.counsellor,
    preferredDate: newDate,
    preferredTime: newTime,
    bookingType: this.bookingType,
    notes: this.notes,
    rescheduledFrom: this._id,
    status: 'pending'
  });

  this.status = 'rescheduled';
  return this.save().then(() => newBooking.save());
};

bookingSchema.methods.submitFeedback = function(rating, comments) {
  this.feedback = {
    rating,
    comments,
    submittedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
