const mongoose = require('mongoose');

const counsellorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: [true, 'Counsellor name is required'] },
    role: { type: String, default: 'General Counsellor' },
    avatar: { type: String, default: '' },
    region: { type: String, default: '' },
    languages: [{ type: String }],
    activeStudents: { type: Number, default: 0 },
    capacity: { type: Number, default: 40 },
    utilizationRate: { type: Number, default: 0 },
    acceptingLeads: { type: Boolean, default: true },
    conversionRate: { type: Number, default: 0 },
    totalOffers: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },


    recentAssignments: [
      {
        studentName: { type: String },
        type: { type: String, enum: ['auto', 'manual', 'override'], default: 'auto' },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Counsellor', counsellorSchema);
