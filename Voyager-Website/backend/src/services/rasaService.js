const axios = require('axios'); 

const RASA_URL = process.env.RASA_URL || 'http://localhost:5005'; 

/**
 * Service to interact with Rasa NLU server
 */

class RasaService {
    /**
     * Parse user message to detect intent
     * @param {string} message - User's message
     * @returns {Promise<Object>} - Detected intent and entities
     */
    async parseIntent(message) {
      try {
        const response = await axios.post(`${RASA_URL}/model/parse`, {
          text: message
        });
        return response.data;
      } catch (error) {
        console.error('Error parsing intent with Rasa:', error);
        throw new Error('Failed to process message');
      }
    }
     /**
     * Send message to Rasa for processing
     * @param {string} message - User's message
     * @param {string} senderId - Unique identifier for the conversation
     * @returns {Promise<Array>} - Bot responses
     */
    async sendMessage(message, senderId, metadata = {}) {
        try {
          const response = await axios.post(`${RASA_URL}/webhooks/rest/webhook`, {
            sender: senderId,
            message,
            metadata: metadata
          });
          return response.data;
        } catch (error) {
          console.error('Error sending message to Rasa:', error);
          throw new Error('Failed to send message to bot');
        }
      }
}

module.exports = new RasaService();