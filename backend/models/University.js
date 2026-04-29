const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fee: { type: String, default: '' },
    duration: { type: String, default: '' },
    intake: { type: String, default: '' },
    degreeLevel: {
      type: String,
      enum: ['bachelors', 'masters', 'mba', 'phd', 'diploma'],
      default: 'masters',
    },
  },
  { _id: true }
);

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'University name is required'], unique: true },
    location: { type: String, default: '' },
    country: { type: String, default: 'India' },
    logo: { type: String, default: '' },
    logoSource: { type: String, enum: ['manual', 'auto_clearbit', 'auto_wikipedia', 'fallback', 'hardcoded'], default: 'fallback' },
    logoLastUpdated: { type: Date, default: null },
    officialDomain: { type: String, default: '' },
    description: { type: String, default: '' },
    courses: [courseSchema],


    partnerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },


    ytdEnrolled: { type: Number, default: 0 },
    pendingAction: { type: Number, default: 0 },


    documentAccuracy: { type: Number, default: 99.2 },
    offerExtensionRate: { type: Number, default: 74 },


    events: [
      {
        title: { type: String },
        description: { type: String },
        type: { type: String, enum: ['webinar', 'info_session', 'workshop'], default: 'info_session' },
        registeredCount: { type: Number, default: 0 },
        date: { type: Date },
        status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
      },
    ],
  },
  { timestamps: true }
);

universitySchema.index({ name: 'text', country: 1 });

module.exports = mongoose.model('University', universitySchema);
