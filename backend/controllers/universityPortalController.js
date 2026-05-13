const Application = require('../models/Application');
const University = require('../models/University');
const Document = require('../models/Document');



const getPortalDashboard = async (req, res) => {
  try {
    let university = await University.findOne({ partnerUser: req.user._id });
    // Fallback: look up by universityId on the user document
    if (!university && req.user.universityId) {
      console.log(`[PORTAL] Fallback search for universityId: ${req.user.universityId}`);
      university = await University.findById(req.user.universityId);
    }
    if (!university) {
      console.error(`[PORTAL] ❌ No university linked to user: ${req.user._id} (${req.user.email})`);
      return res.status(404).json({ message: 'No university linked to this account. Please contact support.' });
    }
    console.log(`[PORTAL] ✅ Dashboard loaded for: ${university.name}`);


    const totalApps = await Application.countDocuments({ university: university._id });
    const newApps = await Application.countDocuments({ university: university._id, status: 'submitted' });
    const reviewing = await Application.countDocuments({ university: university._id, status: 'under_review' });
    const accepted = await Application.countDocuments({ university: university._id, status: 'accepted' });

    res.json({
      university: {
        name: university.name,
        logo: university.logo,
        ytdEnrolled: university.ytdEnrolled || accepted,
        pendingAction: newApps + reviewing,
      },
      stats: { totalApps, newApps, reviewing, accepted },
      events: university.events || [],
      qualityMetrics: {
        documentAccuracy: university.documentAccuracy,
        offerExtensionRate: university.offerExtensionRate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getApplicants = async (req, res) => {
  try {
    // Try to find university via partnerUser (for linked accounts)
    let university = await University.findOne({ partnerUser: req.user._id });

    // Fallback: look up by universityId on the user document
    if (!university && req.user.universityId) {
      console.log(`[PORTAL] Fallback search (applicants) for universityId: ${req.user.universityId}`);
      university = await University.findById(req.user.universityId);
    }
    if (!university) {
      console.error(`[PORTAL] ❌ No university linked for applicants view: ${req.user._id}`);
      return res.status(404).json({ message: 'No university linked to this account' });
    }
    console.log(`[PORTAL] 📋 Fetching applicants for: ${university.name}`);

    const { status, course, stage } = req.query;
    let query = { university: university._id };

    if (status) query.status = status;
    if (course) query.course = { $regex: course, $options: 'i' };

    // Show all applications for this university regardless of stage
    // Partners can see applications at any stage so they can take action early
    if (stage) {
      query.pipelineStage = stage;
    }
    // Only exclude draft applications
    if (!status) {
      query.status = { $ne: 'draft' };
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const total = await Application.countDocuments(query);

    const applicants = await Application.find(query)
      .populate('student', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Return full student object so the frontend can use app.student.firstName etc.
    const results = applicants.map((app) => ({
      _id: app._id,
      appId: `APP-${app._id.toString().slice(-4).toUpperCase()}`,
      course: app.course,
      aiMatchScore: app.aiMatchScore || Math.floor(75 + Math.random() * 25),
      status: app.status,
      updatedAt: app.updatedAt,
      createdAt: app.createdAt,
      pipelineStage: app.pipelineStage,
      student: app.student
        ? {
            firstName: app.student.firstName,
            lastName: app.student.lastName,
            email: app.student.email,
            phone: app.student.phone || '',
          }
        : { firstName: 'Unknown', lastName: '', email: '' },
      // Include full academic details for university partners
      academics: app.academics || {
        institution: '',
        degree: '',
        cgpa: '',
        passingYear: '',
        transcriptDoc: null
      },
      // Include test scores for university partners
      testScores: app.testScores || {
        gre: null,
        ielts: null,
        toefl: null,
        gate: null,
        gmat: null,
        jee: null,
        cat: null
      },
    }));

    res.json({
      success: true,
      count: results.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const decideApplicant = async (req, res) => {
  try {
    const { decision } = req.body;

    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be "accepted" or "rejected"' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: decision,
        currentStep: 4,
        pipelineStage: 'decision',
        decisionDate: new Date(),
      },
      { new: true }
    ).populate('student', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const uploadOfferLetter = async (req, res) => {
  try {
    const Document = require('../models/Document');
    const university = await University.findOne({ partnerUser: req.user._id });
    if (!university) return res.status(404).json({ message: 'No university linked' });

    const application = await Application.findOne({ _id: req.params.id, university: university._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (!req.file) return res.status(400).json({ message: 'No offer PDF uploaded' });

    const fileSizeBytes = req.file.size;
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(1) + ' MB';


    const offerDoc = await Document.create({
       student: application.student,
       name: `Offer Letter - ${university.name}`,
       category: 'academic',
       filePath: req.file.path,
       fileSize: fileSizeMB,
       originalName: req.file.originalname,
       status: 'verified',
    });


    application.status = 'accepted';
    application.currentStep = 4;
    application.pipelineStage = 'decision';
    application.decisionDate = new Date();
    await application.save();


    res.status(201).json({ message: 'Offer uploaded successfully', document: offerDoc, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplicantDocuments = async (req, res) => {
  try {
    const university = await University.findOne({ partnerUser: req.user._id }) || 
                       (req.user.universityId ? await University.findById(req.user.universityId) : null);
    
    if (!university) {
      return res.status(404).json({ message: 'No university linked' });
    }

    const application = await Application.findOne({ 
      _id: req.params.id, 
      university: university._id 
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found for your institution' });
    }

    const documents = await Document.find({ student: application.student });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitOnboarding = async (req, res) => {
  try {
    const {
      universityName,
      website,
      address,
      city,
      state,
      country,
      contactEmail,
      contactPhone,
      description,
      establishedYear,
      accreditation,
      type
    } = req.body;

    // Validate required fields
    if (!universityName || !address || !city || !state || !country) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check if university with same name already exists
    const existingUniversity = await University.findOne({ name: universityName });
    if (existingUniversity) {
      return res.status(409).json({ message: 'University with this name already exists' });
    }

    // Create new university
    // Check if university name already exists
    const existingUni = await University.findOne({ name: universityName });
    if (existingUni) {
      return res.status(400).json({ message: 'A university with this name is already registered' });
    }

    const university = await University.create({
      name: universityName,
      website: website || '',
      address,
      city,
      state,
      country,
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || '',
      description: description || '',
      establishedYear: establishedYear || '',
      accreditation: accreditation || '',
      type: type || 'Private',
      partnerUser: req.user._id,
      status: 'pending_approval', // Pending admin approval
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update user with university reference
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      universityId: university._id
    });

    // Send notification to admin
    try {
      const { sendEmail } = require('../utils/emailService');
      const admin = await require('../models/User').findOne({ role: 'admin' });
      
      if (admin && admin.email) {
        await sendEmail({
          to: admin.email,
          subject: 'New University Partner Onboarding',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New University Partner Registration</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #333; margin: 0 0 20px 0;">New University Registration Details</h2>
                <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>University:</strong> ${universityName}</p>
                  <p style="margin: 5px 0;"><strong>Type:</strong> ${type}</p>
                  <p style="margin: 5px 0;"><strong>Location:</strong> ${city}, ${state}, ${country}</p>
                  <p style="margin: 5px 0;"><strong>Contact Email:</strong> ${contactEmail}</p>
                  <p style="margin: 5px 0;"><strong>Website:</strong> ${website || 'Not provided'}</p>
                  <p style="margin: 5px 0;"><strong>Established:</strong> ${establishedYear || 'Not provided'}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; padding: 15px 30px; text-decoration: none; 
                            border-radius: 25px; font-weight: bold; display: inline-block;">
                    Review in Admin Dashboard
                  </a>
                </div>
              </div>
              
              <div style="text-align: center; color: #999; font-size: 12px;">
                <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'University onboarding submitted successfully. Your application is now under review.',
      university: {
        id: university._id,
        name: university.name,
        status: university.status
      }
    });
  } catch (error) {
    console.error('University onboarding error:', error);
    res.status(500).json({ message: 'Failed to submit onboarding information' });
  }
};

module.exports = { 
  getPortalDashboard, 
  getApplicants, 
  decideApplicant, 
  uploadOfferLetter,
  getApplicantDocuments,
  submitOnboarding
};
