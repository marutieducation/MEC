const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const University = require('../models/University');
const { v4: uuidv4 } = require('uuid');

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, type, scheduledDate, scheduledTime, duration, platform, instructions } = req.body;

    if (!applicationId || !type || !scheduledDate || !scheduledTime || !platform) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Validate application exists and belongs to university
    const application = await Application.findById(applicationId).populate('student university');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (req.user.role === 'university_partner') {
      if (!req.user.universityId || application.university._id.toString() !== req.user.universityId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate date is in the future
    const interviewDate = new Date(scheduledDate);
    if (interviewDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Interview date must be in the future' });
    }

    // Check for interviewer conflicts
    const interviewerId = req.user._id; // For now, schedule with the current user
    const conflict = await Interview.checkConflict(interviewerId, scheduledDate, scheduledTime, duration || 30);
    if (conflict) {
      return res.status(400).json({ message: 'Interviewer has a conflicting interview at this time' });
    }

    // Create interview
    const interview = new Interview({
      application: applicationId,
      student: application.student._id,
      university: application.university._id,
      interviewer: interviewerId,
      type,
      scheduledDate: interviewDate,
      scheduledTime,
      duration: duration || 30,
      platform,
      instructions: instructions || '',
    });

    // Generate meeting details
    await interview.generateMeetingDetails();

    // Create meeting link based on platform
    let meetingLink = '';
    switch (platform) {
      case 'zoom':
        meetingLink = `https://zoom.us/j/${interview.meetingId}`;
        break;
      case 'google_meet':
        meetingLink = `https://meet.google.com/${interview.meetingId}`;
        break;
      case 'teams':
        meetingLink = `https://teams.microsoft.com/l/meetup-join/${interview.meetingId}`;
        break;
      default:
        meetingLink = '';
    }

    if (meetingLink) {
      interview.meetingLink = meetingLink;
    }

    await interview.save();

    // Send notification emails
    try {
      const sendEmail = require('../utils/emailService');
      
      // Email to student
      await sendEmail({
        to: application.student.email,
        subject: `Interview Scheduled - ${application.university.name}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Interview Scheduled</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Interview Details</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>University:</strong> ${application.university.name}</p>
                <p style="margin: 5px 0;"><strong>Interview Type:</strong> ${type.replace('_', ' ').toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${interviewDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration || 30} minutes</p>
                <p style="margin: 5px 0;"><strong>Platform:</strong> ${platform.replace('_', ' ').toUpperCase()}</p>
                ${meetingLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                ${interview.meetingPassword ? `<p style="margin: 5px 0;"><strong>Password:</strong> ${interview.meetingPassword}</p>` : ''}
                ${instructions ? `<p style="margin: 5px 0;"><strong>Instructions:</strong> ${instructions}</p>` : ''}
              </div>
              
              <p style="color: #666; margin: 20px 0;">Please join the interview 5 minutes before the scheduled time. Make sure you have a stable internet connection and required documents ready.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });

      // Email to interviewer
      await sendEmail({
        to: req.user.email,
        subject: `Interview Scheduled - ${application.student.firstName} ${application.student.lastName}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Interview Scheduled</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Interview Details</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Student:</strong> ${application.student.firstName} ${application.student.lastName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${application.student.email}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${application.student.phone || 'Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Interview Type:</strong> ${type.replace('_', ' ').toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${interviewDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration || 30} minutes</p>
                <p style="margin: 5px 0;"><strong>Platform:</strong> ${platform.replace('_', ' ').toUpperCase()}</p>
                ${meetingLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                ${interview.meetingPassword ? `<p style="margin: 5px 0;"><strong>Password:</strong> ${interview.meetingPassword}</p>` : ''}
              </div>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send interview notification emails:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: {
        id: interview._id,
        type: interview.type,
        scheduledDate: interview.scheduledDate,
        scheduledTime: interview.scheduledTime,
        platform: interview.platform,
        meetingLink: interview.meetingLink,
        meetingId: interview.meetingId,
        meetingPassword: interview.meetingPassword,
        status: interview.status
      }
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Failed to schedule interview' });
  }
};

const getStudentInterviews = async (req, res) => {
  try {
    const { status } = req.query;
    const interviews = await Interview.getStudentInterviews(req.user._id, status);

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get student interviews error:', error);
    res.status(500).json({ message: 'Failed to get interviews' });
  }
};

const getInterviewerInterviews = async (req, res) => {
  try {
    const { status } = req.query;
    const interviews = await Interview.getInterviewerInterviews(req.user._id, status);

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get interviewer interviews error:', error);
    res.status(500).json({ message: 'Failed to get interviews' });
  }
};

const getUniversityInterviews = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Check authorization
    if (req.user.role === 'university_partner') {
      if (!req.user.universityId) {
        return res.status(400).json({ message: 'University not linked to your account' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const universityId = req.user.universityId || req.query.universityId;
    const interviews = await Interview.getUniversityInterviews(universityId, status);

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get university interviews error:', error);
    res.status(500).json({ message: 'Failed to get interviews' });
  }
};

const getUpcomingInterviews = async (req, res) => {
  try {
    const interviews = await Interview.getUpcomingInterviews(req.user._id, req.user.role);

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json({ message: 'Failed to get upcoming interviews' });
  }
};

const getTodayInterviews = async (req, res) => {
  try {
    const interviews = await Interview.getTodayInterviews(req.user._id, req.user.role);

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get today interviews error:', error);
    res.status(500).json({ message: 'Failed to get today interviews' });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { status, reason } = req.body;

    const interview = await Interview.findById(interviewId).populate('student university interviewer');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check authorization
    const isAuthorized = 
      (req.user.role === 'student' && interview.student._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'interviewer' && interview.interviewer._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'university_partner' && interview.university._id.toString() === req.user.universityId?.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }

    switch (status) {
      case 'confirmed':
        await interview.confirmInterview();
        break;
      case 'in_progress':
        await interview.startInterview();
        break;
      case 'completed':
        await interview.completeInterview();
        break;
      case 'cancelled':
        await interview.cancelInterview(reason, req.user._id);
        break;
      case 'no_show':
        await interview.markNoShow();
        break;
      default:
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Send notification if cancelled
    if (status === 'cancelled') {
      try {
        const sendEmail = require('../utils/emailService');
        const recipient = req.user.role === 'student' ? interview.interviewer : interview.student;
        
        await sendEmail({
          to: recipient.email,
          subject: 'Interview Cancelled - MEC UAFMS',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Interview Cancelled</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #333; margin: 0 0 20px 0;">Interview Cancelled</h2>
                <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${interview.scheduledDate.toLocaleDateString()}</p>
                  <p style="margin: 5px 0;"><strong>Time:</strong> ${interview.scheduledTime}</p>
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
    }

    res.json({
      success: true,
      message: `Interview ${status.replace('_', ' ')} successfully`,
      interview: {
        id: interview._id,
        status: interview.status,
        completedAt: interview.completedAt
      }
    });
  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({ message: 'Failed to update interview status' });
  }
};

const rescheduleInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { newDate, newTime, newDuration, reason } = req.body;

    if (!interviewId || !newDate || !newTime) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const interview = await Interview.findById(interviewId).populate('student university interviewer');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check authorization
    const isAuthorized = 
      (interview.student._id.toString() === req.user._id.toString()) ||
      (interview.interviewer._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'university_partner' && interview.university._id.toString() === req.user.universityId?.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if interview can be rescheduled (more than 24 hours away)
    if (!interview.canBeRescheduled) {
      return res.status(400).json({ message: 'Interview cannot be rescheduled less than 24 hours before the scheduled time' });
    }

    // Check for conflicts
    const conflict = await Interview.checkConflict(
      interview.interviewer._id, 
      newDate, 
      newTime, 
      newDuration || interview.duration, 
      interviewId
    );

    if (conflict) {
      return res.status(400).json({ message: 'Interviewer has a conflicting interview at the new time' });
    }

    const newInterview = await interview.rescheduleInterview(new Date(newDate), newTime, newDuration);

    // Send notifications
    try {
      const sendEmail = require('../utils/emailService');
      const recipient = req.user._id.toString() === interview.student._id.toString() 
        ? interview.interviewer 
        : interview.student;

      await sendEmail({
        to: recipient.email,
        subject: 'Interview Rescheduled - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Interview Rescheduled</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">New Interview Details</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Old Date:</strong> ${interview.scheduledDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Old Time:</strong> ${interview.scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>New Date:</strong> ${new Date(newDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>New Time:</strong> ${newTime}</p>
                <p style="margin: 5px 0;"><strong>Rescheduled by:</strong> ${req.user.firstName} ${req.user.lastName}</p>
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
      console.error('Failed to send reschedule notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Interview rescheduled successfully',
      newInterview: {
        id: newInterview._id,
        scheduledDate: newInterview.scheduledDate,
        scheduledTime: newInterview.scheduledTime,
        status: newInterview.status
      }
    });
  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json({ message: 'Failed to reschedule interview' });
  }
};

const submitInterviewFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const feedbackData = req.body;

    const interview = await Interview.findById(interviewId).populate('student');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check authorization - only interviewer or admin can submit feedback
    if (interview.interviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await interview.submitFeedback(feedbackData, req.user._id);

    // Send feedback notification to student
    try {
      const sendEmail = require('../utils/emailService');
      
      await sendEmail({
        to: interview.student.email,
        subject: 'Interview Feedback Available - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Interview Feedback Available</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Interview Completed</h2>
              <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${interview.scheduledDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${interview.scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>Interviewer:</strong> ${req.user.firstName} ${req.user.lastName}</p>
                <p style="margin: 5px 0;"><strong>Overall Rating:</strong> ${feedbackData.overallRating}/10</p>
                ${feedbackData.recommendation ? `<p style="margin: 5px 0;"><strong>Recommendation:</strong> ${feedbackData.recommendation.replace('_', ' ').toUpperCase()}</p>` : ''}
              </div>
              
              <p style="color: #666; margin: 20px 0;">Your interview feedback has been submitted. You can view the detailed feedback in your student dashboard.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send feedback notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Interview feedback submitted successfully',
      feedback: interview.feedback
    });
  } catch (error) {
    console.error('Submit interview feedback error:', error);
    res.status(500).json({ message: 'Failed to submit interview feedback' });
  }
};

module.exports = {
  scheduleInterview,
  getStudentInterviews,
  getInterviewerInterviews,
  getUniversityInterviews,
  getUpcomingInterviews,
  getTodayInterviews,
  updateInterviewStatus,
  rescheduleInterview,
  submitInterviewFeedback
};
