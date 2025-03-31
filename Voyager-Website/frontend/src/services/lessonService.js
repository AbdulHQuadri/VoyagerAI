import api from './api';

/**
 * Lesson-related API calls
 */

const lessonService = {
  /**
   * Get all available lessons
   * @returns {Promise<Array>} - List of lessons
   */
  getAllLessons: async () => {
    try {
      const response = await api.get('/lessons');
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch lessons');
    }
  },

  /**
   * Get a specific lesson by name
   * @param {string} lessonName - Name of the lesson
   * @returns {Promise<Object>} - Lesson data
   */
  getLesson: async (lessonName) => {
    try {
      const response = await api.get(`/lessons/${lessonName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lesson ${lessonName}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch lesson');
    }
  },

  /**
   * Get available languages
   * @returns {Promise<Array>} - List of available languages
   */
  getLanguages: async () => {
    try {
      const response = await api.get('/lessons/languages');
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch languages');
    }
  }
};

export default lessonService;