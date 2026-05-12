const Application = require('../models/Application');
const University = require('../models/University');
const Document = require('../models/Document');



const getPortalDashboard = async (req, res) => {
  try {
    let university = await University.findOne({ partnerUser: req.user._id });
    // Fallback: look up by universityId on the user document
    if (!university && req.user.universityId) {
      university = await University.findById(req.user.universityId);
    }
    if (!university) {
      return res.status(404).json({ message: 'No university linked to this account' });
    }


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
      university = await University.findById(req.user.universityId);
    }

    if (!university) {
      return res.status(404).json({ message: 'No university linked to this account' });
    }

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

module.exports = { 
  getPortalDashboard, 
  getApplicants, 
  decideApplicant, 
  uploadOfferLetter,
  getApplicantDocuments 
};
