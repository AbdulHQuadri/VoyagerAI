const LessonModel = require('../models/Lesson');

/**
 * Controller for lesson-related operations
 */
class LessonController {
  /**
   * Get all lessons
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllLessons(req, res) {
    try {
      // Get query parameters for filtering
      const { language, difficulty } = req.query;
      
      // Get lessons from model
      const lessons = await LessonModel.getAllLessons();
      
      // Apply filters if provided
      let filteredLessons = lessons;
      if (language) {
        filteredLessons = filteredLessons.filter(lesson => 
          lesson.language === language
        );
      }
      if (difficulty) {
        filteredLessons = filteredLessons.filter(lesson => 
          lesson.difficulty === difficulty
        );
      }
      
      return res.status(200).json({
        success: true,
        data: filteredLessons
      });
    } catch (error) {
      console.error('Error getting lessons:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve lessons'
      });
    }
  }

  /**
   * Get a specific lesson by name
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLesson(req, res) {
    try {
      const { lessonName } = req.params;
      
      if (!lessonName) {
        return res.status(400).json({
          success: false,
          message: 'Lesson name is required'
        });
      }
      
      const lesson = await LessonModel.getLesson(lessonName);
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error(`Error getting lesson ${req.params.lessonName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve lesson'
      });
    }
  }

  /**
   * Get available languages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLanguages(req, res) {
    try {
      // This would eventually come from your database
      const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' }
        // Add more languages as your app supports them
      ];
      
      return res.status(200).json({
        success: true,
        data: languages
      });
    } catch (error) {
      console.error('Error getting languages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve languages'
      });
    }
  }
}

module.exports = new LessonController();