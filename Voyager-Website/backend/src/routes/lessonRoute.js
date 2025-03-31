const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

/**
 * @route   GET /api/lessons
 * @desc    Get all available lessons
 * @access  Public
 */
router.get('/', lessonController.getAllLessons);

/**
 * @route   GET /api/lessons/languages
 * @desc    Get available languages
 * @access  Public
 */
router.get('/languages', lessonController.getLanguages);

/**
 * @route   GET /api/lessons/:lessonName
 * @desc    Get a specific lesson by name
 * @access  Public
 */
router.get('/:lessonName', lessonController.getLesson);

module.exports = router;