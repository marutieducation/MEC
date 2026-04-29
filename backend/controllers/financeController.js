const Invoice = require('../models/Invoice');



const getInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};


    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('student', 'firstName lastName email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));


    const allInvoices = await Invoice.find(req.user.role === 'student' ? { student: req.user._id } : {});
    const totalPaid = allInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (i.amountNumeric || 0), 0);
    const totalPending = allInvoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + (i.amountNumeric || 0), 0);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      invoices,
      summary: {
        totalPaid: `₹${totalPaid.toLocaleString('en-IN')}`,
        totalPending: `₹${totalPending.toLocaleString('en-IN')}`,
        count: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const createInvoice = async (req, res) => {
  try {
    const { student, studentName, description, amount, amountNumeric, currency, status } = req.body;


    const count = await Invoice.countDocuments({});
    const invoiceId = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const invoice = await Invoice.create({
      invoiceId,
      student,
      studentName: studentName || '',
      description,
      amount,
      amountNumeric: amountNumeric || 0,
      currency: currency || 'INR',
      status: status || 'pending',
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const payInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = 'paid';
    invoice.paymentMethod = req.body.paymentMethod || 'razorpay';
    invoice.transactionId = `TXN-${Date.now()}`;
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoices, createInvoice, payInvoice };
