const Application = require('../models/Application');
const User = require('../models/User');
const crypto = require('crypto');

const submitLead = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, universityId, course, source } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Missing required fields: firstName, lastName, email' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        phone: phone || '',
        password: crypto.randomBytes(18).toString('base64url'),
        role: 'student',
        profileCompleted: false
      });
    }

    const application = await Application.create({
      student: user._id,
      university: universityId || null,
      course: course || 'Interested in Learning More',
      source: source || 'Public Lead Form',
      pipelineStage: 'leads',
      status: 'submitted',
      submittedAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Lead submitted successfully. Our team will contact you soon.',
      data: {
        leadId: application._id
      }
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ message: 'Failed to submit lead. Please try again later.' });
  }
};

module.exports = {
  submitLead
};
