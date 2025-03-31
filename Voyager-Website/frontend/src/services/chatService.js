// src/services/chatService.js
import api from './api';

const chatService = {
  /**
   * Process a message within a lesson context
   * @param {Object} data - Message data
   * @param {string} data.message - User's message
   * @param {string} data.lessonName - Name of the current lesson
   * @param {string} data.currentIntent - Current conversation intent
   * @param {string} data.sessionId - Unique session identifier
   * @param {boolean} data.intentMode - Whether to just return intent information
   * @returns {Promise<Object>} - API response
   */
  processMessage: async (data) => {
    try {
      const response = await api.post('/chat/message', data);
      return response.data;
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error(error.response?.data?.message || 'Failed to process message');
    }
  },

  /**
   * Check grammar for a text
   * @param {string} text - Text to check
   * @param {string} language - Language code (e.g., 'en', 'es')
   * @returns {Promise<Object>} - Grammar check results
   */
  checkGrammar: async (text, language = 'en') => {
    try {
      const response = await api.post('/chat/grammar', { text, language });
      return response.data;
    } catch (error) {
      console.error('Error checking grammar:', error);
      throw new Error(error.response?.data?.message || 'Failed to check grammar');
    }
  },

  /**
   * Check just the intent of a message, without requiring a conversation
   * @param {string} message - Message to analyze
   * @param {string} lessonContext - Optional lesson context
   * @returns {Promise<Object>} - Intent detection results
   */
  checkIntent: async (message, lessonContext = '') => {
    try {
      const response = await api.post('/chat/detect-intent', { 
        message, 
        lessonContext 
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting intent:', error);
      throw new Error(error.response?.data?.message || 'Failed to detect intent');
    }
  },

  /**
   * Get available intents for a specific lesson or all intents
   * @param {string} lessonName - Optional lesson name to filter intents
   * @returns {Promise<Array>} - List of available intents
   */
  getAvailableIntents: async (lessonName = '') => {
    try {
      const params = lessonName ? { lesson: lessonName } : {};
      const response = await api.get('/chat/intents', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching intents:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch intents');
    }
  }
};

export default chatService;