const Payment = require('../models/Payment');
const Application = require('../models/Application');
const User = require('../models/User');
const crypto = require('crypto');

// Razorpay integration
let razorpay = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (error) {
  console.warn('Razorpay not available:', error.message);
}

const createPaymentOrder = async (req, res) => {
  try {
    const { applicationId, amount, currency = 'INR' } = req.body;

    if (!applicationId || !amount) {
      return res.status(400).json({ message: 'Application ID and amount are required' });
    }

    // Validate application exists and belongs to user
    const application = await Application.findOne({ 
      _id: applicationId, 
      student: req.user._id 
    }).populate('university');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if payment already exists for this application
    const existingPayment = await Payment.findOne({ 
      application: applicationId, 
      status: { $in: ['pending', 'processing', 'completed'] }
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already initiated for this application' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${applicationId}_${Date.now()}`,
      notes: {
        applicationId: applicationId,
        userId: req.user._id,
        universityId: application.university._id
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = await Payment.create({
      user: req.user._id,
      application: applicationId,
      university: application.university._id,
      amount,
      currency,
      paymentMethod: 'razorpay',
      paymentId: order.id,
      orderId: order.id,
      status: 'pending',
      gatewayResponse: order
    });

    res.status(201).json({
      success: true,
      order,
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'All payment verification fields are required' });
    }

    // Find payment record
    const payment = await Payment.findOne({ paymentId: razorpay_order_id }).populate('application university user');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment record
    payment.paymentId = razorpay_payment_id;
    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.gatewayResponse = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };

    await payment.save();

    // Update application status
    await Application.findByIdAndUpdate(payment.application._id, {
      paymentStatus: 'paid',
      status: 'payment_completed'
    });

    // Send confirmation email
    try {
      const sendEmail = require('../utils/emailService');
      await sendEmail({
        to: payment.user.email,
        subject: 'Payment Confirmation - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Payment Successful</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Payment Confirmation</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${payment.amount}</p>
                <p style="margin: 5px 0;"><strong>University:</strong> ${payment.university.name}</p>
                <p style="margin: 5px 0;"><strong>Course:</strong> ${payment.application.course}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/student" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 25px; font-weight: bold; display: inline-block;">
                  View Application Status
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        completedAt: payment.completedAt
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId })
      .populate('application university user');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment belongs to user
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentDate: payment.paymentDate,
        completedAt: payment.completedAt,
        application: {
          id: payment.application._id,
          course: payment.application.course,
          university: payment.university.name
        }
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('application university')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Failed to get payments' });
  }
};

const processRefund = async (req, res) => {
  try {
    const { paymentId, refundAmount, refundReason } = req.body;

    if (!paymentId || !refundAmount || !refundReason) {
      return res.status(400).json({ message: 'Payment ID, refund amount, and reason are required' });
    }

    const payment = await Payment.findOne({ paymentId })
      .populate('application university user');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed payment amount' });
    }

    // Process refund with Razorpay
    try {
      const refund = await razorpay.payments.refund(payment.paymentId, {
        amount: refundAmount * 100 // Convert to paise
      });

      // Update payment record
      await payment.processRefund(refundAmount, refundReason);

      // Send refund confirmation email
      try {
        const sendEmail = require('../utils/emailService');
        await sendEmail({
          to: payment.user.email,
          subject: 'Refund Processed - MEC UAFMS',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Refund Processed</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #333; margin: 0 0 20px 0;">Refund Details</h2>
                <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Refund ID:</strong> ${refund.id}</p>
                  <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ₹${refundAmount}</p>
                  <p style="margin: 5px 0;"><strong>Reason:</strong> ${refundReason}</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${refund.status}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style="text-align: center; color: #999; font-size: 12px;">
                <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send refund email:', emailError);
      }

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refund: {
          id: refund.id,
          amount: refundAmount,
          status: refund.status
        }
      });
    } catch (razorpayError) {
      console.error('Razorpay refund error:', razorpayError);
      res.status(500).json({ message: 'Failed to process refund with payment gateway' });
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Refund processing failed' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  getUserPayments,
  processRefund
};
