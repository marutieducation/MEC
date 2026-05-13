const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    course: { type: String, required: [true, 'Course name is required'] },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'action_required'],
      default: 'draft',
    },
    currentStep: { type: Number, default: 1, min: 1, max: 4 },



    academics: {
      institution: { type: String, default: '' },
      degree: { type: String, default: '' },
      cgpa: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      transcriptDoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    },


    testScores: {
      gre: { type: Number, default: null },
      ielts: { type: Number, default: null },
      toefl: { type: Number, default: null },
      gate: { type: Number, default: null },
      gmat: { type: Number, default: null },
      jee: { type: Number, default: null },
      cat: { type: Number, default: null },
    },


    missingDocuments: [{ type: String }],


    counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counsellor', default: null },


    aiMatchScore: { type: Number, default: 0 },


    pipelineStage: {
      type: String,
      enum: ['leads', 'verified', 'review', 'shortlist', 'decision'],
      default: 'leads',
    },


    source: {
      type: String,
      enum: ['Web', 'Referral', 'Walk-in', 'Campaign'],
      default: 'Web',
    },


    submittedAt: { type: Date, default: null },
    decisionDate: { type: Date, default: null },
  },
  { timestamps: true }
);


applicationSchema.index({ student: 1, university: 1, course: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ pipelineStage: 1 });
applicationSchema.index({ university: 1, pipelineStage: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ updatedAt: -1 });
applicationSchema.index({ student: 1, createdAt: -1 });
applicationSchema.index({ university: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
