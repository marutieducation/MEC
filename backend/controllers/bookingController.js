const Booking = require('../models/Booking');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const bookConsultation = async (req, res) => {
  try {
    const { preferredDate, preferredTime, bookingType, notes } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Preferred date and time are required' });
    }

    // Validate date is in the future
    const bookingDate = new Date(preferredDate);
    if (bookingDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Booking date must be in the future' });
    }

    // Get available counsellors
    const counsellors = await User.find({ 
      role: 'counsellor', 
      isActive: true 
    }).select('_id firstName lastName email');

    if (counsellors.length === 0) {
      return res.status(404).json({ message: 'No counsellors available at the moment' });
    }

    // Simple round-robin assignment for demo
    const randomIndex = Math.floor(Math.random() * counsellors.length);
    const assignedCounsellor = counsellors[randomIndex];

    // Create booking
    const booking = await Booking.createBooking({
      student: req.user._id,
      counsellor: assignedCounsellor._id,
      preferredDate: bookingDate,
      preferredTime,
      bookingType: bookingType || 'initial_consultation',
      notes: notes || ''
    });

    // Send confirmation emails
    try {
      const sendEmail = require('../utils/emailService');
      
      // Email to student
      await sendEmail({
        to: req.user.email,
        subject: 'Consultation Booking Confirmed - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Consultation Booking Confirmed</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Your Consultation Details</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${bookingDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${preferredTime}</p>
                <p style="margin: 5px 0;"><strong>Counsellor:</strong> ${assignedCounsellor.firstName} ${assignedCounsellor.lastName}</p>
                <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${booking.status}</p>
              </div>
              
              <p style="color: #666; margin: 20px 0;">Our counsellor will contact you shortly to confirm the meeting details and share the meeting link.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });

      // Email to counsellor
      await sendEmail({
        to: assignedCounsellor.email,
        subject: 'New Consultation Booking - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Consultation Booking</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Booking Details</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Student:</strong> ${req.user.firstName} ${req.user.lastName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${req.user.email}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${req.user.phone || 'Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${bookingDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${preferredTime}</p>
                <p style="margin: 5px 0;"><strong>Booking Type:</strong> ${bookingType || 'initial_consultation'}</p>
                <p style="margin: 5px 0;"><strong>Notes:</strong> ${notes || 'No additional notes'}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/counsellor" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 25px; font-weight: bold; display: inline-block;">
                  View in Counsellor Dashboard
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
      console.error('Failed to send booking confirmation emails:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      booking: {
        id: booking._id,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        status: booking.status,
        counsellor: {
          firstName: assignedCounsellor.firstName,
          lastName: assignedCounsellor.lastName,
          email: assignedCounsellor.email
        }
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to book consultation' });
  }
};

const getStudentBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const bookings = await Booking.getStudentBookings(req.user._id, status);
    
    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking._id,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        status: booking.status,
        bookingType: booking.bookingType,
        notes: booking.notes,
        meetingLink: booking.meetingLink,
        meetingId: booking.meetingId,
        meetingPassword: booking.meetingPassword,
        counsellor: booking.counsellor,
        createdAt: booking.createdAt,
        completedAt: booking.completedAt,
        feedback: booking.feedback
      }))
    });
  } catch (error) {
    console.error('Get student bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
};

const getCounsellorBookings = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    if (req.user.role !== 'counsellor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let bookings;
    if (req.user.role === 'counsellor') {
      bookings = await Booking.getCounsellorBookings(req.user._id, status);
    } else {
      // Admin can see all bookings
      let query = {};
      if (status) query.status = status;
      bookings = await Booking.find(query)
        .populate('student counsellor', 'firstName lastName email phone')
        .sort({ preferredDate: 1 });
    }

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking._id,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        status: booking.status,
        bookingType: booking.bookingType,
        notes: booking.notes,
        meetingLink: booking.meetingLink,
        meetingId: booking.meetingId,
        meetingPassword: booking.meetingPassword,
        student: booking.student,
        counsellor: booking.counsellor,
        createdAt: booking.createdAt,
        completedAt: booking.completedAt,
        feedback: booking.feedback
      }))
    });
  } catch (error) {
    console.error('Get counsellor bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { date, counsellorId } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    let targetCounsellorId = counsellorId;
    
    // If no counsellor specified, get a random available one
    if (!targetCounsellorId) {
      const counsellors = await User.find({ 
        role: 'counsellor', 
        isActive: true 
      }).select('_id');
      
      if (counsellors.length === 0) {
        return res.status(404).json({ message: 'No counsellors available' });
      }
      
      targetCounsellorId = counsellors[0]._id;
    }

    const bookedSlots = await Booking.getAvailableSlots(targetCounsellorId, new Date(date));
    
    const allTimeSlots = [
      '10:00 AM - 12:00 PM',
      '12:00 PM - 02:00 PM', 
      '02:00 PM - 04:00 PM',
      '04:00 PM - 06:00 PM'
    ];

    const availableSlots = allTimeSlots.filter(slot => 
      !bookedSlots.some(booking => booking.preferredTime === slot)
    );

    res.json({
      success: true,
      availableSlots,
      date,
      counsellorId: targetCounsellorId
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Failed to get available slots' });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { bookingId, meetingLink, meetingId, meetingPassword } = req.body;

    if (req.user.role !== 'counsellor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if counsellor is authorized
    if (req.user.role === 'counsellor' && booking.counsellor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await booking.confirmBooking({ meetingLink, meetingId, meetingPassword });

    // Send confirmation to student
    try {
      const sendEmail = require('../utils/emailService');
      const student = await User.findById(booking.student);
      
      await sendEmail({
        to: student.email,
        subject: 'Consultation Confirmed - Meeting Details',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Consultation Confirmed</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Meeting Details</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.preferredDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.preferredTime}</p>
                ${meetingLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                ${meetingId ? `<p style="margin: 5px 0;"><strong>Meeting ID:</strong> ${meetingId}</p>` : ''}
                ${meetingPassword ? `<p style="margin: 5px 0;"><strong>Password:</strong> ${meetingPassword}</p>` : ''}
              </div>
              
              <p style="color: #666; margin: 20px 0;">Please join the meeting 5 minutes before the scheduled time.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send meeting confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        meetingLink: booking.meetingLink,
        meetingId: booking.meetingId,
        meetingPassword: booking.meetingPassword
      }
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ message: 'Failed to confirm booking' });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId, newDate, newTime } = req.body;

    if (!bookingId || !newDate || !newTime) {
      return res.status(400).json({ message: 'Booking ID, new date, and new time are required' });
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.student.toString() !== req.user._id.toString() && 
        booking.counsellor.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newBooking = await booking.rescheduleBooking(new Date(newDate), newTime);

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      newBooking: {
        id: newBooking._id,
        preferredDate: newBooking.preferredDate,
        preferredTime: newBooking.preferredTime,
        status: newBooking.status
      }
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ message: error.message || 'Failed to reschedule booking' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId).populate('student counsellor');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.student._id.toString() !== req.user._id.toString() && 
        booking.counsellor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await booking.cancelBooking(reason);

    // Send cancellation notification
    try {
      const sendEmail = require('../utils/emailService');
      
      // Notify the other party
      const recipient = req.user._id.toString() === booking.student._id.toString() 
        ? booking.counsellor 
        : booking.student;

      await sendEmail({
        to: recipient.email,
        subject: 'Consultation Cancelled - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Consultation Cancelled</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Booking Cancelled</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.preferredDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.preferredTime}</p>
                <p style="margin: 5px 0;"><strong>Cancelled by:</strong> ${req.user.firstName} ${req.user.lastName}</p>
                ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send cancellation notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

module.exports = {
  bookConsultation,
  getStudentBookings,
  getCounsellorBookings,
  getAvailableSlots,
  confirmBooking,
  rescheduleBooking,
  cancelBooking
};
