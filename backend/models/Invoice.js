const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, default: '' },
    description: { type: String, required: [true, 'Invoice description is required'] },
    amount: { type: String, required: true },
    amountNumeric: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'net_banking', 'upi', 'razorpay', 'stripe'],
      default: 'razorpay',
    },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);

InvoiceSchema.index({ student: 1 });
InvoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
