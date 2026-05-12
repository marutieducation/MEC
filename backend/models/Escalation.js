const mongoose = require('mongoose');

const EscalationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Escalation title is required'] },
    description: { type: String, default: '' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    studentName: { type: String, default: '' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
    type: { type: String, default: 'General' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

EscalationSchema.index({ assignedTo: 1, status: 1 });
EscalationSchema.index({ priority: -1 });
EscalationSchema.index({ severity: -1 });

module.exports = mongoose.model('Escalation', EscalationSchema);
