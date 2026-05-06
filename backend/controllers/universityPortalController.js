const Application = require('../models/Application');
const University = require('../models/University');



const getPortalDashboard = async (req, res) => {
  try {

    const university = await University.findOne({ partnerUser: req.user._id });
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
    const university = await University.findOne({ partnerUser: req.user._id });
    if (!university) {
      return res.status(404).json({ message: 'No university linked to this account' });
    }

    const { status, course } = req.query;
    let query = { university: university._id };

    if (status) query.status = status;
    if (course) query.course = course;

    // Only show applications that have been sent for review or are in the final decision stage
    query.pipelineStage = { $in: ['review', 'decision'] };

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const total = await Application.countDocuments(query);

    const applicants = await Application.find(query)
      .populate('student', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const results = applicants.map((app) => ({
      _id: app._id,
      appId: `APP-${app._id.toString().slice(-4).toUpperCase()}`,
      name: app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Unknown',
      course: app.course,
      aiMatchScore: app.aiMatchScore,
      status: app.status === 'submitted' ? 'New' : app.status === 'under_review' ? 'Reviewing' : app.status,
      date: app.createdAt,
    }));

    res.json({
      success: true,
      count: results.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: results
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
    const Notification = require('../models/Notification');
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


    const newNotif = await Notification.create({
       user: application.student,
       title: 'Offer Letter Received! 🎉',
       message: `Congratulations! ${university.name} has accepted your application and uploaded an official offer letter.`,
       type: 'success',
       link: '/student/locker'
    });

    if (req.io) {
       req.io.to(application.student.toString()).emit('notification', newNotif);
    }

    res.status(201).json({ message: 'Offer uploaded successfully', document: offerDoc, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortalDashboard, getApplicants, decideApplicant, uploadOfferLetter };
