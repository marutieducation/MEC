
const express = require('express');
const router = express.Router();
const { getConversation, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/:userId', protect, getConversation);
router.post('/:userId', protect, sendMessage);

module.exports = router;
