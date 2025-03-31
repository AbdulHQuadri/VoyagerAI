const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * @route   POST /api/chat/message
 * @desc    Process a user message within a lesson
 * @access  Public
 */
router.post('/message', chatController.processMessage);

/**
 * @route   POST /api/chat/grammar
 * @desc    Check grammar for a text
 * @access  Public
 */
router.post('/grammar', chatController.checkGrammar);

/**
 * @route    POST /api/chat/detect-intent
 * @desc     Detect intent of a message without conversation context
 * @access   Private (Admin)
 */



module.exports = router;