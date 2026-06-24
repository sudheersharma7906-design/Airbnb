const express = require('express');
const { getChatHistory, getConversations, sendMessageAPI } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/history/:userId', protect, getChatHistory);
router.post('/send', protect, sendMessageAPI);

module.exports = router;
