const Scholarship = require('../models/Scholarship');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const User = require('../models/User');

const createScholarship = async (req, res) => {
  try {
    const scholarshipData = {
      ...req.body,
      createdBy: req.user._id
    };

    const scholarship = new Scholarship(scholarshipData);
    await scholarship.save();

    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      scholarship
    });
  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(500).json({ message: 'Failed to create scholarship' });
  }
};

const getScholarships = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      type,
      degreeLevel,
      field,
      nationality,
      minAmount,
      maxAmount,
      featured,
      status
    } = req.query;

    const searchCriteria = {
      keyword,
      type,
      degreeLevel,
      field,
      nationality,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      featured: featured === 'true',
      status
    };

    const scholarships = await Scholarship.searchScholarships(searchCriteria)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Scholarship.countDocuments({
      status: status || 'active'
    });

    res.json({
      success: true,
      scholarships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ message: 'Failed to get scholarships' });
  }
};

const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findById(id)
      .populate('university', 'name logo website')
      .populate('createdBy', 'firstName lastName');

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json({
      success: true,
      scholarship
    });
  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({ message: 'Failed to get scholarship' });
  }
};

const getFeaturedScholarships = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const scholarships = await Scholarship.getFeaturedScholarships(parseInt(limit));

    res.json({
      success: true,
      scholarships
    });
  } catch (error) {
    console.error('Get featured scholarships error:', error);
    res.status(500).json({ message: 'Failed to get featured scholarships' });
  }
};

const getExpiringSoonScholarships = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const scholarships = await Scholarship.getExpiringSoon(parseInt(days));

    res.json({
      success: true,
      scholarships
    });
  } catch (error) {
    console.error('Get expiring soon scholarships error:', error);
    res.status(500).json({ message: 'Failed to get expiring soon scholarships' });
  }
};

const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const scholarship = await Scholarship.findById(id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Check authorization
    if (scholarship.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(scholarship, updates);
    await scholarship.save();

    res.json({
      success: true,
      message: 'Scholarship updated successfully',
      scholarship
    });
  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({ message: 'Failed to update scholarship' });
  }
};

const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findById(id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Check authorization
    if (scholarship.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if there are any applications
    const applicationCount = await ScholarshipApplication.countDocuments({ scholarship: id });
    if (applicationCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete scholarship with existing applications' 
      });
    }

    await Scholarship.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({ message: 'Failed to delete scholarship' });
  }
};

const applyForScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const applicationData = req.body;

    // Check if scholarship exists and is active
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (!scholarship.isAvailable) {
      return res.status(400).json({ message: 'Scholarship is not available for application' });
    }

    // Check if student already applied
    const existingApplication = await ScholarshipApplication.findOne({
      scholarship: scholarshipId,
      student: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }

    // Create application
    const application = new ScholarshipApplication({
      scholarship: scholarshipId,
      student: req.user._id,
      applicationData
    });

    await application.save();

    // Calculate eligibility score
    await application.calculateScore(scholarship);

    res.status(201).json({
      success: true,
      message: 'Scholarship application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        eligibilityScore: application.eligibilityScore,
        submittedAt: application.submittedAt
      }
    });
  } catch (error) {
    console.error('Apply for scholarship error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const applications = await ScholarshipApplication.getApplicationsByStudent(req.user._id, status);

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({ message: 'Failed to get applications' });
  }
};

const getScholarshipApplications = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const { status } = req.query;

    // Check authorization
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await ScholarshipApplication.getApplicationsByScholarship(scholarshipId, status);

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get scholarship applications error:', error);
    res.status(500).json({ message: 'Failed to get applications' });
  }
};

const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, comments } = req.body;

    const application = await ScholarshipApplication.findById(applicationId)
      .populate('scholarship');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (application.scholarship.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await application.reviewApplication(req.user._id, comments, status);

    // Send notification to student
    try {
      const sendEmail = require('../utils/emailService');
      const student = await User.findById(application.student);
      
      await sendEmail({
        to: student.email,
        subject: `Scholarship Application Update - ${application.scholarship.title}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Scholarship Application Update</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Application Status Update</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Scholarship:</strong> ${application.scholarship.title}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
                ${comments ? `<p style="margin: 5px 0;"><strong>Comments:</strong> ${comments}</p>` : ''}
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/student/scholarships" 
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
      console.error('Failed to send application update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Application reviewed successfully',
      application: {
        id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt,
        reviewComments: application.reviewComments
      }
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ message: 'Failed to review application' });
  }
};

const getPendingApplications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await ScholarshipApplication.getPendingApplications();

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({ message: 'Failed to get pending applications' });
  }
};

const checkEligibility = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const studentProfile = req.body;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    const eligibilityResult = scholarship.checkEligibility(studentProfile);

    res.json({
      success: true,
      eligibility: eligibilityResult
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ message: 'Failed to check eligibility' });
  }
};

module.exports = {
  createScholarship,
  getScholarships,
  getScholarshipById,
  getFeaturedScholarships,
  getExpiringSoonScholarships,
  updateScholarship,
  deleteScholarship,
  applyForScholarship,
  getStudentApplications,
  getScholarshipApplications,
  reviewApplication,
  getPendingApplications,
  checkEligibility
};
