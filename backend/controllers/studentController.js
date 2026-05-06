const User = require('../models/User');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Counsellor = require('../models/Counsellor');
const University = require('../models/University');
const Escalation = require('../models/Escalation');
const Notification = require('../models/Notification');



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



const bookConsultation = async (req, res) => {
  try {
    const studentId = req.user._id;
    const studentName = `${req.user.firstName} ${req.user.lastName}`;
    const { preferredDate, preferredTime } = req.body;


    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(500).json({ message: 'No admin available to assign consultation.' });
    const assigneeId = admin._id;

    // Check if student already has an open consultation
    const existingConsultation = await Escalation.findOne({
      student: studentId,
      status: { $in: ['open', 'in_progress'] },
      type: 'Counseling'
    });

    if (existingConsultation) {
       return res.status(400).json({ message: 'You already have an open counseling request.' });
    }

    let description = `Student ${studentName} requested a counseling session.`;
    if (preferredDate && preferredTime) {
       description += `\n\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}`;
    }

    const escalation = await Escalation.create({
      title: 'New Counseling Request',
      description: description,
      student: studentId,
      studentName: studentName,
      type: 'Counseling',
      severity: 'high',
      status: 'open',
      assignedTo: assigneeId,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });


    const newNotif = await Notification.create({
       user: assigneeId,
       title: 'New Consultation Request',
       message: `${studentName} has requested a consultation strategy call.`,
       type: 'info',
       link: '/counsellor/students'
    });

    if (req.io) {
       req.io.to(assigneeId.toString()).emit('notification', newNotif);
    }

    res.status(201).json({
      message: 'Consultation request submitted successfully',
      escalationId: escalation._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getConsultations = async (req, res) => {
  try {
    const studentId = req.user._id;
    const consultations = await Escalation.find({
      student: studentId,
      type: 'Counseling'
    }).populate('assignedTo', 'firstName lastName').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelConsultation = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { id } = req.params;

    const consultation = await Escalation.findOne({
      _id: id,
      student: studentId,
      type: 'Counseling'
    });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found.' });
    }

    if (consultation.status === 'closed' || consultation.status === 'resolved') {
      return res.status(400).json({ message: 'Cannot cancel a closed or resolved consultation.' });
    }

    consultation.status = 'closed';
    await consultation.save();

    res.json({ success: true, message: 'Consultation cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, completeProfile, bookConsultation, getConsultations, cancelConsultation };
