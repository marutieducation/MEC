const Application = require('../models/Application');
const Escalation = require('../models/Escalation');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const University = require('../models/University');
const Counsellor = require('../models/Counsellor');
const VerificationCode = require('../models/VerificationCode');
const crypto = require('crypto');



const getPipeline = async (req, res) => {
  try {
    const stageInfo = [
      { id: 'leads', name: 'New Leads', bg: 'bg-info/5' },
      { id: 'verified', name: 'Verified', bg: 'bg-warning/5' },
      { id: 'shortlist', name: 'Shortlisted', bg: 'bg-primary/5' },
      { id: 'review', name: 'University Review', bg: 'bg-success/5' },
      { id: 'decision', name: 'Final Decision', bg: 'bg-danger/5' },
    ];

    const allCards = await Application.find({})
      .populate('student', 'firstName lastName')
      .populate('university', 'name logo')
      .populate({
        path: 'counsellor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ updatedAt: -1 });

    const columns = await Promise.all(stageInfo.map(async (stage) => ({
      ...stage,
      count: await Application.countDocuments({ pipelineStage: stage.id })
    })));


    const totalActive = await Application.countDocuments({
      status: { $nin: ['accepted', 'rejected'] },
    });
    const totalOffers = await Application.countDocuments({ status: 'accepted' });
    const totalApps = await Application.countDocuments({});
    const offerRate = totalApps > 0 ? Math.round((totalOffers / totalApps) * 100) : 0;

    const paidInvoices = await Invoice.find({ status: 'paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amountNumeric || 0), 0);

    res.json({
      success: true,
      data: {
        columns,
        cards: allCards,
        funnelMetrics: {
          activeApps: totalActive,
          offerRate,
          revenue: totalRevenue,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const movePipelineCard = async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['leads', 'verified', 'review', 'shortlist', 'decision'];
    const stageUpdates = {
      leads: { pipelineStage: 'leads', status: 'submitted', currentStep: 1 },
      verified: { pipelineStage: 'verified', status: 'submitted', currentStep: 1 },
      shortlist: { pipelineStage: 'shortlist', status: 'submitted', currentStep: 2 },
      review: { pipelineStage: 'review', status: 'under_review', currentStep: 3 },
      decision: { pipelineStage: 'decision', currentStep: 4 },
    };

    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid pipeline stage' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      stageUpdates[stage],
      { new: true }
    ).populate('student', 'firstName lastName')
     .populate('university', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getAnalytics = async (req, res) => {
  try {

    const funnelData = [
      { name: 'Leads', students: await Application.countDocuments({ pipelineStage: 'leads' }) },
      { name: 'Verified', students: await Application.countDocuments({ pipelineStage: 'verified' }) },
      { name: 'Applied', students: await Application.countDocuments({ pipelineStage: 'review' }) },
      { name: 'Offers', students: await Application.countDocuments({ status: 'accepted' }) },
      { name: 'Enrolled', students: Math.floor(await Application.countDocuments({ status: 'accepted' }) * 0.7) },
    ];


    const revenueData = [
      { name: 'North India', value: 45 },
      { name: 'South India', value: 30 },
      { name: 'West India', value: 15 },
      { name: 'East India', value: 10 },
    ];


    const trendData = [
      { name: 'Jan', revenue: 4000000 },
      { name: 'Feb', revenue: 3000000 },
      { name: 'Mar', revenue: 5000000 },
      { name: 'Apr', revenue: 4500000 },
      { name: 'May', revenue: 6000000 },
      { name: 'Jun', revenue: 8000000 },
    ];


    const totalRevenue = trendData.reduce((sum, t) => sum + t.revenue, 0);
    const totalApps = await Application.countDocuments({});
    const totalOffers = await Application.countDocuments({ status: 'accepted' });
    const conversionRate = totalApps > 0 ? ((totalOffers / totalApps) * 100).toFixed(1) : 0;
    const totalActive = await Application.countDocuments({
      status: { $nin: ['accepted', 'rejected'] },
    });
    const activePartners = await University.countDocuments({});

    const recentApps = await Application.find({})
      .populate('student', 'firstName lastName')
      .populate('university', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentActivities = recentApps.map(app => ({
      time: 'Recent',
      user: `${app.student?.firstName || 'Student'} ${app.student?.lastName || ''}`,
      action: `Applied to ${app.university?.name || 'University'}`,
      color: 'bg-primary',
      detail: `${app.course} • ${app.intakeTerm || '2024'}`,
      createdAt: app.createdAt
    }));

    res.json({
      success: true,
      data: {
        funnelMetrics: {
          activeApps: totalActive,
          offerRate: conversionRate,
          revenue: totalRevenue,
        },
        funnelData,
        revenueData,
        trendData,
        recentActivities,
        activePartners,
        kpis: {
          totalRevenue: totalRevenue >= 10000000
            ? `₹${(totalRevenue / 10000000).toFixed(2)} Cr`
            : `₹${(totalRevenue / 100000).toFixed(2)} Lakh`,
          conversionRate: `${conversionRate}%`,
          avgProcessTime: '18 Days',
          activePartners,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getPreferences = async (req, res) => {
  try {
    const popularUniversities = await Application.aggregate([
      { $group: { _id: '$university', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $lookup: { from: 'universities', localField: '_id', foreignField: '_id', as: 'universityDetails' } },
      { $unwind: '$universityDetails' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$universityDetails.name',
          location: '$universityDetails.location',
          country: '$universityDetails.country',
          logo: '$universityDetails.logo'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        popularUniversities
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getEscalations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const query = {};
    const total = await Escalation.countDocuments(query);

    const escalations = await Escalation.find(query)
      .populate('student', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ severity: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      count: escalations.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: escalations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateEscalation = async (req, res) => {
  try {
    const escalation = await Escalation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!escalation) {
      return res.status(404).json({ message: 'Escalation not found' });
    }

    res.json(escalation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getInviteCodes = async (req, res) => {
  try {
    const codes = await VerificationCode.find()
      .populate('createdBy', 'firstName lastName')
      .populate('usedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: codes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const generateInviteCode = async (req, res) => {
  try {
    const { type = 'admin_registration' } = req.body;
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newCode = await VerificationCode.create({
      code,
      type,
      createdBy: req.user._id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    res.status(201).json({ success: true, data: newCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getCounselingRequests = async (req, res) => {
  try {
    const Escalation = require('../models/Escalation');
    const requests = await Escalation.find({ type: 'Counseling' })
      .populate('student', 'firstName lastName phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateCounselingRequest = async (req, res) => {
  try {
    const Escalation = require('../models/Escalation');
    const request = await Escalation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Counseling request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, universityId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || 'university_partner',
      phone: phone || '',
    };

    if (universityId) {
      userData.universityId = universityId;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      const user = await User.findById(req.params.id).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      Object.assign(user, req.body);
      await user.save();

      const sanitizedUser = user.toObject();
      delete sanitizedUser.password;
      return res.json({ success: true, data: sanitizedUser });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const deleteUser = async (req, res) => {
  try {
    console.log(`[ADMIN] Delete request received for ID: ${req.params.id}`);
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      console.log(`[ADMIN] User not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[ADMIN] User ${user.email} deleted successfully`);


    const Application = require('../models/Application');
    const Document = require('../models/Document');

    const [invoiceResult, appResult, docResult] = await Promise.all([
      Invoice.deleteMany({ student: req.params.id }),
      Application.deleteMany({ student: req.params.id }),
      Document.deleteMany({ student: req.params.id }),
    ]);

    console.log(`[ADMIN] Cascade delete — Invoices: ${invoiceResult.deletedCount}, Apps: ${appResult.deletedCount}, Docs: ${docResult.deletedCount}`);


    await Counsellor.findOneAndDelete({ user: req.params.id });

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully',
      cascade: {
        invoices: invoiceResult.deletedCount,
        applications: appResult.deletedCount,
        documents: docResult.deletedCount,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLead = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, universityId, course, source } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        phone: phone || '',
        password: crypto.randomBytes(18).toString('base64url'),
        role: 'student'
      });
    }

    const application = await Application.create({
      student: user._id,
      university: universityId,
      course,
      source: source || 'Web',
      pipelineStage: 'leads',
      status: 'submitted',
      submittedAt: new Date()
    });

    const populatedApp = await Application.findById(application._id)
      .populate('student', 'firstName lastName')
      .populate('university', 'name logo');

    res.status(201).json({ success: true, data: populatedApp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPipeline, movePipelineCard, getAnalytics, getPreferences,
  getEscalations, updateEscalation,
  getInviteCodes, generateInviteCode,
  getUsers, createUser, updateUser, deleteUser,
  getCounselingRequests, updateCounselingRequest,
  createLead
};
