const express = require('express');
const router = express.Router();
const {
  generateApplicationsReport,
  generateRevenueReport,
  generateUserAnalytics,
  generateApplicationAnalytics,
  generateScholarshipAnalytics,
  exportData
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Report generation routes
router.get('/applications', protect, authorize('admin', 'university_partner'), generateApplicationsReport);
router.get('/revenue', protect, authorize('admin', 'university_partner'), generateRevenueReport);
router.get('/users/analytics', protect, authorize('admin'), generateUserAnalytics);
router.get('/applications/analytics', protect, authorize('admin', 'university_partner'), generateApplicationAnalytics);
router.get('/scholarships/analytics', protect, authorize('admin', 'university_partner'), generateScholarshipAnalytics);

// Data export routes
router.get('/export', protect, exportData);

module.exports = router;
