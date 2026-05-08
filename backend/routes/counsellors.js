const express = require('express');
const router = express.Router();
const {
  getCounsellors, addCounsellor, updateCounsellor, deleteCounsellor
} = require('../controllers/counsellorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getCounsellors);
router.post('/', protect, authorize('admin'), addCounsellor);
router.put('/:id', protect, authorize('admin'), updateCounsellor);
router.delete('/:id', protect, authorize('admin'), deleteCounsellor);


module.exports = router;
