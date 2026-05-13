const express = require('express');
const router = express.Router();
const {
  getPortalDashboard, getApplicants, decideApplicant, uploadOfferLetter, getApplicantDocuments, submitOnboarding
} = require('../controllers/universityPortalController');
const { protect, authorize } = require('../middleware/auth');
const { upload, ensureUploadDir } = require('../middleware/upload');

router.get('/dashboard', protect, authorize('university_partner'), getPortalDashboard);
router.get('/applicants', protect, authorize('university_partner'), getApplicants);
router.put('/applicants/:id/decide', protect, authorize('university_partner'), decideApplicant);
router.get('/applicants/:id/documents', protect, authorize('university_partner'), getApplicantDocuments);
router.post('/applicants/:id/offer', protect, authorize('university_partner'), ensureUploadDir, upload.single('offer'), uploadOfferLetter);
router.post('/onboarding', protect, authorize('university_partner'), submitOnboarding);

module.exports = router;
