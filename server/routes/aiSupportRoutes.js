const express = require('express');
const { handleAIChat } = require('../controllers/aiSupportController');

const router = express.Router();

// POST /api/ai-support/chat
router.post('/chat', handleAIChat);

module.exports = router;
