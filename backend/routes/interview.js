const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getStudentInterviews,
  getInterviewerInterviews,
  getUniversityInterviews,
  getUpcomingInterviews,
  getTodayInterviews,
  updateInterviewStatus,
  rescheduleInterview,
  submitInterviewFeedback
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validation');

// Interview scheduling routes
router.post('/schedule', protect, authorize('admin', 'university_partner'), strictLimiter, validate('interview'), scheduleInterview);

// Get interviews based on user role
router.get('/my-interviews', protect, getStudentInterviews);
router.get('/interviewer-interviews', protect, authorize('interviewer', 'admin'), getInterviewerInterviews);
router.get('/university-interviews', protect, authorize('university_partner', 'admin'), getUniversityInterviews);

// Dashboard routes
router.get('/upcoming', protect, getUpcomingInterviews);
router.get('/today', protect, getTodayInterviews);

// Interview management routes
router.put('/:interviewId/status', protect, updateInterviewStatus);
router.post('/:interviewId/reschedule', protect, strictLimiter, rescheduleInterview);
router.post('/:interviewId/feedback', protect, authorize('interviewer', 'admin'), submitInterviewFeedback);

module.exports = router;
