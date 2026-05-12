const express = require('express');
const router = express.Router();
const {
  uploadDocument, getDocuments, downloadDocument,
  verifyDocument, getDocumentHistory, deleteDocument,
  getStudentDocuments, approveDocument, rejectDocument,
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const { upload, ensureUploadDir, validateFileType } = require('../middleware/upload');


router.post('/upload', protect, ensureUploadDir, upload.single('file'), validateFileType, uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id/download', protect, downloadDocument);
router.delete('/:id', protect, deleteDocument);
router.get('/:id/history', protect, getDocumentHistory);


router.get('/student/:studentId', protect, authorize('admin'), getStudentDocuments);
router.put('/:id/verify', protect, authorize('admin'), verifyDocument);
router.put('/:id/approve', protect, authorize('admin'), approveDocument);
router.put('/:id/reject', protect, authorize('admin'), rejectDocument);

module.exports = router;
