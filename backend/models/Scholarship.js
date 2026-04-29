const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  university: { type: String },
  amount: { type: String, required: true },
  deadline: { type: String, required: true },
  match: { type: Number, default: 90 },
  applyUrl: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['merit', 'need', 'female', 'research', 'general'], default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
