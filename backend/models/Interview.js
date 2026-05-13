const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'hr', 'portfolio_review', 'group_discussion', 'video_essay', 'phone_screen', 'onsite'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // minutes
    required: true
  },
  platform: {
    type: String,
    enum: ['zoom', 'google_meet', 'teams', 'skype', 'phone', 'onsite', 'other'],
    required: true
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
  dialInNumber: {
    type: String
  },
  accessCode: {
    type: String
  },
  location: {
    type: String // For onsite interviews
  },
  instructions: {
    type: String,
    maxlength: 1000
  },
  preparationMaterials: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'other']
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'scheduled'
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  feedback: {
    overallRating: {
      type: Number,
      min: 1,
      max: 10
    },
    technicalRating: {
      type: Number,
      min: 1,
      max: 10
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 10
    },
    strengths: [{
      type: String,
      maxlength: 200
    }],
    weaknesses: [{
      type: String,
      maxlength: 200
    }],
    comments: {
      type: String,
      maxlength: 1000
    },
    recommendation: {
      type: String,
      enum: ['strong_hire', 'hire', 'borderline', 'no_hire', 'strong_no_hire']
    },
    submittedAt: {
      type: Date
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  recording: {
    isRecorded: {
      type: Boolean,
      default: false
    },
    recordingLink: String,
    recordingAvailableUntil: Date
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    scheduledAt: Date,
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  communicationLog: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'sms', 'portal']
    },
    subject: String,
    content: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
interviewSchema.index({ application: 1 });
interviewSchema.index({ student: 1, status: 1 });
interviewSchema.index({ university: 1, status: 1 });
interviewSchema.index({ interviewer: 1, scheduledDate: 1 });
interviewSchema.index({ scheduledDate: 1, status: 1 });
interviewSchema.index({ status: 1 });

// Virtual fields
interviewSchema.virtual('isUpcoming').get(function() {
  return this.status === 'scheduled' || this.status === 'confirmed';
});

interviewSchema.virtual('isPast').get(function() {
  return new Date(this.scheduledDate) < new Date();
});

interviewSchema.virtual('canBeRescheduled').get(function() {
  const now = new Date();
  const interviewTime = new Date(this.scheduledDate);
  const hoursUntilInterview = (interviewTime - now) / (1000 * 60 * 60);
  return this.isUpcoming && hoursUntilInterview > 24; // Can reschedule if more than 24 hours away
});

// Static methods
interviewSchema.statics.getStudentInterviews = function(studentId, status = null) {
  const query = { student: studentId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('university', 'name logo')
    .populate('interviewer', 'firstName lastName email')
    .sort({ scheduledDate: 1 });
};

interviewSchema.statics.getInterviewerInterviews = function(interviewerId, status = null) {
  const query = { interviewer: interviewerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('student', 'firstName lastName email phone')
    .populate('university', 'name logo')
    .sort({ scheduledDate: 1 });
};

interviewSchema.statics.getUniversityInterviews = function(universityId, status = null) {
  const query = { university: universityId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('student', 'firstName lastName email')
    .populate('interviewer', 'firstName lastName email')
    .sort({ scheduledDate: 1 });
};

interviewSchema.statics.getUpcomingInterviews = function(userId, role) {
  const now = new Date();
  let query = {
    scheduledDate: { $gte: now },
    status: { $in: ['scheduled', 'confirmed'] }
  };

  if (role === 'student') {
    query.student = userId;
  } else if (role === 'interviewer') {
    query.interviewer = userId;
  }

  return this.find(query)
    .populate('student university interviewer')
    .sort({ scheduledDate: 1 });
};

interviewSchema.statics.getTodayInterviews = function(userId, role) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let query = {
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
  };

  if (role === 'student') {
    query.student = userId;
  } else if (role === 'interviewer') {
    query.interviewer = userId;
  }

  return this.find(query)
    .populate('student university interviewer')
    .sort({ scheduledTime: 1 });
};

interviewSchema.statics.checkConflict = function(interviewerId, date, time, duration, excludeId = null) {
  const interviewStart = new Date(`${date} ${time}`);
  const interviewEnd = new Date(interviewStart.getTime() + duration * 60 * 1000);

  let query = {
    interviewer: interviewerId,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    $or: [
      {
        scheduledDate: { $lt: interviewEnd },
        $expr: {
          $lt: [
            { $add: ["$scheduledDate", { $multiply: ["$duration", 60000] }] },
            interviewStart
          ]
        }
      },
      {
        scheduledDate: { $gte: interviewStart, $lt: interviewEnd }
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

// Instance methods
interviewSchema.methods.confirmInterview = function() {
  this.status = 'confirmed';
  return this.save();
};

interviewSchema.methods.startInterview = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

interviewSchema.methods.completeInterview = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

interviewSchema.methods.cancelInterview = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  return this.save();
};

interviewSchema.methods.markNoShow = function() {
  this.status = 'no_show';
  return this.save();
};

interviewSchema.methods.rescheduleInterview = function(newDate, newTime, newDuration) {
  const newInterview = new this.constructor({
    application: this.application,
    student: this.student,
    university: this.university,
    interviewer: this.interviewer,
    type: this.type,
    scheduledDate: newDate,
    scheduledTime: newTime,
    duration: newDuration || this.duration,
    platform: this.platform,
    instructions: this.instructions,
    preparationMaterials: this.preparationMaterials,
    rescheduledFrom: this._id
  });

  this.status = 'rescheduled';
  return this.save().then(() => newInterview.save());
};

interviewSchema.methods.submitFeedback = function(feedbackData, submittedBy) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date(),
    submittedBy
  };
  return this.save();
};

interviewSchema.methods.addNote = function(content, addedBy) {
  this.notes.push({ content, addedBy });
  return this.save();
};

interviewSchema.methods.scheduleReminder = function(type, scheduledAt) {
  this.reminders.push({ type, scheduledAt });
  return this.save();
};

interviewSchema.methods.logCommunication = function(type, subject, content, sentBy) {
  this.communicationLog.push({ type, subject, content, sentBy });
  return this.save();
};

interviewSchema.methods.generateMeetingDetails = function() {
  const meetingId = `INT-${this._id.toString().slice(-8).toUpperCase()}`;
  const meetingPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  this.meetingId = meetingId;
  this.meetingPassword = meetingPassword;
  
  return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);
