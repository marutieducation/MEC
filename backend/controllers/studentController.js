const User = require('../models/User');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Counsellor = require('../models/Counsellor');
const University = require('../models/University');



const getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;


    const applications = await Application.find({ student: studentId })
      .populate('university', 'name logo location')
      .sort({ updatedAt: -1 });


    const documents = await Document.find({ student: studentId });
    const missingDocs = documents.filter((d) => d.status === 'missing').length;
    const pendingDocs = documents.filter((d) => d.status === 'pending').length;


    const counsellorAssignment = applications.find((a) => a.counsellor);
    let counsellor = null;
    if (counsellorAssignment) {
      counsellor = await Counsellor.findById(counsellorAssignment.counsellor)
        .populate('user', 'firstName lastName email');
    }


    const totalApps = applications.length;
    const completedSteps = applications.reduce((sum, app) => sum + app.currentStep, 0);
    const maxSteps = totalApps * 4;
    const overallProgress = maxSteps > 0 ? Math.round((completedSteps / maxSteps) * 100) : 0;


    const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
    const actionRequired = applications.filter((a) => a.status === 'action_required').length;


    const nextDeadline = applications.length > 0
      ? new Date(new Date().getFullYear(), 10, 15).toISOString()
      : null;


    let recommendations = await Application.find({ student: studentId })
      .populate('university', 'name logo')
      .sort({ aiMatchScore: -1 })
      .limit(5);

    let mappedRecommendations = [];
    if (recommendations.length > 0) {
      mappedRecommendations = recommendations.map((r) => ({
        name: r.university?.name || 'Partner University',
        topCourse: r.course || 'General Admission',
        logo: r.university?.logo,
      }));
    } else {

      const featuredUnis = await University.find({}).limit(5);
      mappedRecommendations = featuredUnis.map((uni) => ({
        name: uni.name,
        topCourse: uni.courses?.[0]?.name || 'Featured Course',
        logo: uni.logo,
      }));
    }

    res.json({
      data: {
        metrics: {
          overallProgress,
          activeApplications: totalApps,
          acceptedApplications: acceptedCount,
          pendingActions: missingDocs + pendingDocs + actionRequired,
          nextDeadline,
        },
        applications: applications.slice(0, 5),
        counsellor,
        recommendations: mappedRecommendations,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const completeProfile = async (req, res) => {
  try {
    const {
      firstName, lastName, phone, countryCode, city,
      selectedDestinations, selectedDegrees, specialization,
      intakeTerm, budget,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName, lastName, phone, countryCode, city,
        selectedDestinations, selectedDegrees, specialization,
        intakeTerm, budget,
        profileCompleted: true,
      },
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getSavedPrograms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedPrograms.universityId', 'name logo location');
    res.json(user.savedPrograms || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, completeProfile, getSavedPrograms };
