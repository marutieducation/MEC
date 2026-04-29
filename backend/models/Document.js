const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Document name is required'] },
    category: {
      type: String,
      enum: ['identity', 'academic', 'financial', 'language', 'entrance', 'reservation', 'conditional', 'other'],
      required: true,
      default: 'academic',
    },
    filePath: { type: String, default: '' },
    fileSize: { type: String, default: '--' },
    originalName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['verified', 'pending', 'missing', 'rejected'],
      default: 'pending',
    },
    remark: { type: String, default: '' },
    aiFlag: { type: Boolean, default: false },
    aiFlagReason: { type: String, default: '' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    versions: [versionSchema],
    sharedWith: [{ type: String }],
  },
  { timestamps: true }
);

documentSchema.index({ student: 1, category: 1 });

module.exports = mongoose.model('Document', documentSchema);

