const express = require('express');
const router = express.Router();
const { 
  searchUniversities, 
  getUniversity, 
  getRecommendations, 
  createUniversity, 
  getUniversities,
  updateUniversity,
  deleteUniversity
} = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/search', searchUniversities);
router.get('/recommendations', protect, getRecommendations);
router.get('/', protect, authorize('admin', 'student', 'university_partner'), getUniversities);
router.post('/', protect, authorize('admin'), createUniversity);
router.get('/:id', getUniversity);
router.put('/:id', protect, authorize('admin'), updateUniversity);

router.delete('/:id', protect, authorize('admin'), deleteUniversity);

module.exports = router;
