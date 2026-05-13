const mongoose = require('mongoose');

const scholarshipApplicationSchema = new mongoose.Schema({
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationData: {
    personalInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      dateOfBirth: Date,
      nationality: String,
      gender: String,
      address: String
    },
    academicInfo: {
      currentEducation: String,
      degreeLevel: String,
      fieldOfStudy: String,
      institution: String,
      currentYear: Number,
      percentage: Number,
      cgpa: Number,
      graduationYear: Number
    },
    financialInfo: {
      familyIncome: Number,
      familyMembers: Number,
      financialAid: Boolean,
      otherScholarships: Boolean
    },
    documents: [{
      type: String,
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    essays: [{
      question: String,
      answer: String,
      wordCount: Number
    }],
    references: [{
      name: String,
      email: String,
      phone: String,
      relationship: String,
      institution: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String,
    maxlength: 1000
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  acceptanceDetails: {
    amountAwarded: Number,
    duration: String,
    renewalConditions: String,
    nextSteps: String
  },
  documentsVerified: {
    type: Boolean,
    default: false
  },
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDetails: {
    date: Date,
    time: String,
    platform: String,
    link: String,
    interviewer: String
  },
  eligibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  ranking: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
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
scholarshipApplicationSchema.index({ scholarship: 1, student: 1 });
scholarshipApplicationSchema.index({ student: 1, status: 1 });
scholarshipApplicationSchema.index({ scholarship: 1, status: 1 });
scholarshipApplicationSchema.index({ submittedAt: 1 });
scholarshipApplicationSchema.index({ eligibilityScore: -1 });
scholarshipApplicationSchema.index({ ranking: 1 });

// Static methods
scholarshipApplicationSchema.statics.getApplicationsByStudent = function(studentId, status = null) {
  const query = { student: studentId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('scholarship', 'title provider amount applicationDeadline')
    .sort({ submittedAt: -1 });
};

scholarshipApplicationSchema.statics.getApplicationsByScholarship = function(scholarshipId, status = null) {
  const query = { scholarship: scholarshipId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('student', 'firstName lastName email phone')
    .sort({ eligibilityScore: -1, submittedAt: 1 });
};

scholarshipApplicationSchema.statics.getPendingApplications = function() {
  return this.find({ status: 'submitted' })
    .populate('scholarship student')
    .sort({ submittedAt: 1 });
};

scholarshipApplicationSchema.statics.getShortlistedApplications = function(scholarshipId) {
  return this.find({ 
    scholarship: scholarshipId, 
    status: 'shortlisted' 
  })
  .populate('student')
  .sort({ eligibilityScore: -1 });
};

scholarshipApplicationSchema.statics.calculateEligibilityScore = function(application, scholarship) {
  let score = 0;
  const eligibility = scholarship.eligibility;
  const student = application.applicationData;

  // Academic performance (40% weight)
  if (student.academicInfo.percentage) {
    if (eligibility.minPercentage) {
      const percentageScore = Math.min(100, (student.academicInfo.percentage / eligibility.minPercentage) * 100);
      score += percentageScore * 0.4;
    } else {
      score += Math.min(100, student.academicInfo.percentage) * 0.4;
    }
  }

  // Financial need (30% weight) - for need-based scholarships
  if (scholarship.type === 'need_based' && student.financialInfo.familyIncome) {
    if (eligibility.maxIncome) {
      const incomeScore = Math.max(0, 100 - (student.financialInfo.familyIncome / eligibility.maxIncome) * 100);
      score += incomeScore * 0.3;
    }
  }

  // Merit factors (30% weight)
  let meritScore = 0;
  
  // Field relevance
  if (eligibility.fields.length > 0 && student.academicInfo.fieldOfStudy) {
    const fieldMatch = eligibility.fields.some(field => 
      student.academicInfo.fieldOfStudy.toLowerCase().includes(field.toLowerCase())
    );
    if (fieldMatch) meritScore += 30;
  }

  // Additional criteria
  if (student.academicInfo.cgpa && student.academicInfo.cgpa >= 3.5) meritScore += 10;
  if (student.financialInfo.otherScholarships === false) meritScore += 10;
  if (student.financialInfo.financialAid === false) meritScore += 10;

  score += meritScore * 0.3;

  return Math.round(Math.min(100, score));
};

// Instance methods
scholarshipApplicationSchema.methods.submitApplication = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

scholarshipApplicationSchema.methods.reviewApplication = function(reviewerId, comments, status = 'under_review') {
  this.status = status;
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  this.reviewComments = comments;
  return this.save();
};

scholarshipApplicationSchema.methods.acceptApplication = function(acceptanceDetails) {
  this.status = 'accepted';
  this.acceptanceDetails = acceptanceDetails;
  return this.save();
};

scholarshipApplicationSchema.methods.rejectApplication = function(reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  return this.save();
};

scholarshipApplicationSchema.methods.shortlistApplication = function() {
  this.status = 'shortlisted';
  return this.save();
};

scholarshipApplicationSchema.methods.scheduleInterview = function(interviewDetails) {
  this.interviewScheduled = true;
  this.interviewDetails = interviewDetails;
  return this.save();
};

scholarshipApplicationSchema.methods.addNote = function(content, addedBy) {
  this.notes.push({ content, addedBy });
  return this.save();
};

scholarshipApplicationSchema.methods.logCommunication = function(type, subject, content, sentBy) {
  this.communicationLog.push({ type, subject, content, sentBy });
  return this.save();
};

scholarshipApplicationSchema.methods.calculateScore = function(scholarship) {
  this.eligibilityScore = this.constructor.calculateEligibilityScore(this, scholarship);
  return this.save();
};

module.exports = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
