const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['merit_based', 'need_based', 'sports', 'arts', 'community', 'corporate', 'government', 'university_specific'],
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
  amountType: {
    type: String,
    enum: ['fixed', 'percentage', 'full_tuition', 'partial_tuition', 'living_expenses'],
    default: 'fixed'
  },
  eligibility: {
    minPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    maxPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    minIncome: {
      type: Number,
      min: 0
    },
    maxIncome: {
      type: Number,
      min: 0
    },
    nationality: [{
      type: String
    }],
    courses: [{
      type: String
    }],
    degreeLevels: [{
      type: String,
      enum: ['undergraduate', 'postgraduate', 'phd', 'diploma', 'certificate']
    }],
    fields: [{
      type: String
    }],
    ageMin: {
      type: Number,
      min: 0
    },
    ageMax: {
      type: Number,
      min: 0
    },
    gender: {
      type: String,
      enum: ['any', 'male', 'female', 'other']
    },
    specialRequirements: [{
      type: String
    }],
    documents: [{
      type: String
    }]
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  applicationStartDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: String,
    enum: ['one_time', 'yearly', 'semester', 'monthly', 'full_program'],
    default: 'one_time'
  },
  maxAwards: {
    type: Number,
    min: 1
  },
  currentAwards: {
    type: Number,
    default: 0,
    min: 0
  },
  renewalConditions: {
    type: String
  },
  contactInfo: {
    email: {
      type: String
    },
    phone: {
      type: String
    },
    website: {
      type: String
    },
    address: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'draft'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  applicationProcess: {
    type: String
  },
  selectionProcess: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
scholarshipSchema.index({ title: 'text', description: 'text', provider: 'text' });
scholarshipSchema.index({ type: 1, status: 1 });
scholarshipSchema.index({ applicationDeadline: 1 });
scholarshipSchema.index({ featured: 1, status: 1 });
scholarshipSchema.index({ 'eligibility.courses': 1 });
scholarshipSchema.index({ 'eligibility.degreeLevels': 1 });
scholarshipSchema.index({ 'eligibility.fields': 1 });

// Virtual fields
scholarshipSchema.virtual('isExpired').get(function() {
  return this.applicationDeadline < new Date();
});

scholarshipSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && 
         this.applicationStartDate <= new Date() && 
         this.applicationDeadline >= new Date() &&
         (!this.maxAwards || this.currentAwards < this.maxAwards);
});

scholarshipSchema.virtual('daysUntilDeadline').get(function() {
  const today = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static methods
scholarshipSchema.statics.searchScholarships = function(searchCriteria) {
  const {
    keyword,
    type,
    degreeLevel,
    field,
    nationality,
    minAmount,
    maxAmount,
    featured,
    status = 'active'
  } = searchCriteria;

  let query = { status };

  if (featured) {
    query.featured = true;
  }

  if (type) {
    query.type = type;
  }

  if (degreeLevel) {
    query['eligibility.degreeLevels'] = degreeLevel;
  }

  if (field) {
    query['eligibility.fields'] = field;
  }

  if (nationality) {
    query['eligibility.nationality'] = nationality;
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = minAmount;
    if (maxAmount) query.amount.$lte = maxAmount;
  }

  if (keyword) {
    query.$text = { $search: keyword };
  }

  return this.find(query)
    .populate('university', 'name logo')
    .populate('createdBy', 'firstName lastName')
    .sort({ featured: -1, applicationDeadline: 1 });
};

scholarshipSchema.statics.getFeaturedScholarships = function(limit = 10) {
  return this.find({ 
    featured: true, 
    status: 'active',
    applicationDeadline: { $gte: new Date() }
  })
  .populate('university', 'name logo')
  .sort({ applicationDeadline: 1 })
  .limit(limit);
};

scholarshipSchema.statics.getExpiringSoon = function(days = 7) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);

  return this.find({
    status: 'active',
    applicationDeadline: { $lte: deadline, $gte: new Date() }
  })
  .populate('university', 'name logo')
  .sort({ applicationDeadline: 1 });
};

scholarshipSchema.statics.getScholarshipsByUniversity = function(universityId) {
  return this.find({ 
    university: universityId, 
    status: 'active' 
  })
  .populate('createdBy', 'firstName lastName')
  .sort({ applicationDeadline: 1 });
};

// Instance methods
scholarshipSchema.methods.checkEligibility = function(studentProfile) {
  const eligibility = this.eligibility;
  const student = studentProfile;

  // Check percentage criteria
  if (eligibility.minPercentage && student.percentage < eligibility.minPercentage) {
    return { eligible: false, reason: 'Minimum percentage requirement not met' };
  }

  if (eligibility.maxPercentage && student.percentage > eligibility.maxPercentage) {
    return { eligible: false, reason: 'Percentage exceeds maximum limit' };
  }

  // Check income criteria
  if (eligibility.minIncome && student.familyIncome < eligibility.minIncome) {
    return { eligible: false, reason: 'Family income below minimum requirement' };
  }

  if (eligibility.maxIncome && student.familyIncome > eligibility.maxIncome) {
    return { eligible: false, reason: 'Family income exceeds maximum limit' };
  }

  // Check nationality
  if (eligibility.nationality.length > 0 && !eligibility.nationality.includes(student.nationality)) {
    return { eligible: false, reason: 'Nationality not eligible' };
  }

  // Check degree level
  if (eligibility.degreeLevels.length > 0 && !eligibility.degreeLevels.includes(student.degreeLevel)) {
    return { eligible: false, reason: 'Degree level not eligible' };
  }

  // Check field of study
  if (eligibility.fields.length > 0 && !eligibility.fields.some(field => 
    student.fieldOfStudy.toLowerCase().includes(field.toLowerCase())
  )) {
    return { eligible: false, reason: 'Field of study not eligible' };
  }

  // Check age
  if (eligibility.ageMin && student.age < eligibility.ageMin) {
    return { eligible: false, reason: 'Below minimum age requirement' };
  }

  if (eligibility.ageMax && student.age > eligibility.ageMax) {
    return { eligible: false, reason: 'Above maximum age requirement' };
  }

  // Check gender
  if (eligibility.gender && eligibility.gender !== 'any' && student.gender !== eligibility.gender) {
    return { eligible: false, reason: 'Gender not eligible' };
  }

  return { eligible: true };
};

scholarshipSchema.methods.incrementAwards = function() {
  this.currentAwards += 1;
  return this.save();
};

scholarshipSchema.methods.decrementAwards = function() {
  if (this.currentAwards > 0) {
    this.currentAwards -= 1;
  }
  return this.save();
};

module.exports = mongoose.model('Scholarship', scholarshipSchema);
