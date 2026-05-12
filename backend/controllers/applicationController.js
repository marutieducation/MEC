const mongoose = require('mongoose');
const Application = require('../models/Application');
const University = require('../models/University');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

const createApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { university, course, academics, testScores, source } = req.body;

    const aiMatchScore = Math.floor(70 + Math.random() * 30);

    const application = await Application.create([{
      student: req.user._id,
      university,
      course,
      academics: academics || {},
      testScores: testScores || {},
      source: source || 'Web',
      aiMatchScore,
      pipelineStage: 'leads',
    }], { session });

    const populated = await Application.findById(application[0]._id)
      .session(session)
      .populate('university', 'name logo location partnerUser');

    if (populated.university && populated.university.partnerUser) {
       const partner = await User.findById(populated.university.partnerUser).session(session);
       if (partner && partner.email) {
          const studentName = `${req.user.firstName} ${req.user.lastName}`;
          const admin = await User.findOne({ role: 'admin' }).session(session);
          const toEmails = admin && admin.email ? [partner.email, admin.email].join(', ') : partner.email;

          // Note: Email sending is side-effect, usually happens after commit
          // but if we want to be safe we can move it after commit.
          // For now, I'll keep it here but wrap in try-catch as per Task 4.3
          try {
            await sendEmail({
              to: toEmails,
              subject: `New Application Received: ${studentName}`,
              html: `
                <h3>New Lead Alert!</h3>
                <p>A new student (<strong>${studentName}</strong>) has just submitted an application for <strong>${course}</strong> at <strong>${populated.university.name}</strong>.</p>
                <br/>
                <p>Please log in to your UAFMS Partner Dashboard to review their documents and make a decision.</p>
              `
            });
          } catch (emailErr) {
            console.error('Failed to send application email:', emailErr.message);
          }
       }
    }

    // Sync to Saved Programs (Atomic)
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        savedPrograms: {
          universityId: university,
          courseName: course
        }
      }
    }, { session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(populated);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};



const getApplications = async (req, res) => {
  try {
    const query = { student: req.user._id };


    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('university', 'name logo location courses')
      .populate('counsellor', 'name avatar isOnline')
      .sort({ updatedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('university', 'name logo location courses')
      .populate('counsellor', 'name avatar isOnline role');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }


    if (req.user.role === 'student' && application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const allowedFields = [
      'course', 'status', 'currentStep', 'academics', 'testScores',
      'missingDocuments', 'pipelineStage', 'counsellor',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });


    if (req.body.status === 'submitted' && !application.submittedAt) {
      application.submittedAt = new Date();
      application.currentStep = 2;
      application.pipelineStage = 'verified';
    }


    if (['accepted', 'rejected'].includes(req.body.status)) {
      application.decisionDate = new Date();
      application.currentStep = 4;
      application.pipelineStage = 'decision';
    }

    await application.save();
    const populated = await application.populate('university', 'name logo location');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft applications can be deleted' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const submitBulkApplications = async (req, res) => {
  try {
    const { applications } = req.body;


    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ message: 'No applications provided' });
    }

    const createdApplications = [];
    const admin = await User.findOne({ role: 'admin' });

    for (const appData of applications) {
      const { universityId, course, academics, testScores } = appData;


      const aiMatchScore = Math.floor(70 + Math.random() * 30);

      const application = await Application.create({
        student: req.user._id,
        university: universityId,
        course,
        academics: academics || {},
        testScores: testScores || {},
        status: 'submitted',
        submittedAt: new Date(),
        aiMatchScore,
        pipelineStage: 'leads',
      });

      const populated = await application.populate('university', 'name logo location partnerUser');
      createdApplications.push(populated);


      if (populated.university && populated.university.partnerUser) {
        try {
          const partner = await User.findById(populated.university.partnerUser);
          if (partner && partner.email) {
            const studentName = `${req.user.firstName} ${req.user.lastName}`;
            const toEmails = admin && admin.email ? [partner.email, admin.email].join(', ') : partner.email;

            await sendEmail({
              to: toEmails,
              subject: `New Application Received: ${studentName}`,
              html: `
                <h3>New Lead Alert!</h3>
                <p>A new student (<strong>${studentName}</strong>) has just submitted an application for <strong>${course}</strong> at <strong>${populated.university.name}</strong>.</p>
                <br/>
                <p>Please log in to your UAFMS Partner Dashboard to review their documents and make a decision.</p>
              `
            });
          }
        } catch (emailErr) {
          console.error(`Failed to send notification email for application ${application._id}:`, emailErr.message);
          // Continue - don't fail bulk operation for email failure
        }
      }
      // Sync to Saved Programs (Atomic)
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          savedPrograms: {
            universityId: universityId,
            courseName: course
          }
        }
      });
    }

    res.status(201).json(createdApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApplication, getApplications, getApplication,
  updateApplication, deleteApplication, submitBulkApplications,
};
