const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/scholarshipController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getScholarships);
router.get('/featured', getFeaturedScholarships);
router.get('/expiring-soon', getExpiringSoonScholarships);
router.get('/:id', getScholarshipById);
router.post('/:id/check-eligibility', checkEligibility);

// Protected routes
router.post('/', protect, authorize('admin', 'university_partner'), createScholarship);
router.put('/:id', protect, authorize('admin', 'university_partner'), updateScholarship);
router.delete('/:id', protect, authorize('admin', 'university_partner'), deleteScholarship);

// Student routes
router.post('/:id/apply', protect, authorize('student'), applyForScholarship);
router.get('/my/applications', protect, authorize('student'), getStudentApplications);

// Admin/Provider routes
router.get('/:id/applications', protect, authorize('admin', 'university_partner'), getScholarshipApplications);
router.put('/applications/:applicationId/review', protect, authorize('admin', 'university_partner'), reviewApplication);
router.get('/applications/pending', protect, authorize('admin'), getPendingApplications);

module.exports = router;
