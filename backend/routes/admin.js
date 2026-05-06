const express = require('express');
const router = express.Router();
const {
  getPipeline, movePipelineCard, getAnalytics, getPreferences,
  getEscalations, updateEscalation,
  getInviteCodes, generateInviteCode,
  getUsers, createUser, updateUser, deleteUser,
  getCounselingRequests, updateCounselingRequest,
  createLead
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/pipeline', protect, authorize('admin'), getPipeline);
router.put('/pipeline/:id/move', protect, authorize('admin'), movePipelineCard);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/preferences', protect, authorize('admin'), getPreferences);
router.get('/escalations', protect, authorize('admin'), getEscalations);
router.put('/escalations/:id', protect, authorize('admin'), updateEscalation);

router.get('/invite-codes', protect, authorize('admin'), getInviteCodes);
router.post('/invite-codes', protect, authorize('admin'), generateInviteCode);
router.get('/users', protect, authorize('admin'), getUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/counseling-requests', protect, authorize('admin'), getCounselingRequests);
router.put('/counseling-requests/:id', protect, authorize('admin'), updateCounselingRequest);
router.post('/leads', protect, authorize('admin'), createLead);

module.exports = router;
