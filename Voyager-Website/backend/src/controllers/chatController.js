const rasaService = require('../services/rasaService');
const grammarService = require('../services/grammarService');
const LessonModel = require('../models/Lesson');

/**
 * Controller for chat functionality
 */
class ChatController {
  /**
   * Process a user message within a lesson
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processMessage(req, res) {
    try {
      const { message, lessonName, currentIntent, sessionId, intentMode } = req.body;
      
      // If intentMode flag is set, use the detectIntent method instead
      if (intentMode) {
        return this.detectIntent(req, res);
      }
      
      if (!message || !lessonName || !currentIntent) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters'
        });
      }
      // Get lesson data
      const lesson = await LessonModel.getLesson(lessonName);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
      // Check grammar
      const grammarCheck = await grammarService.checkGrammar(message);
      if (grammarCheck.hasErrors) {
        return res.status(200).json({
          success: true,
          type: 'grammar_error',
          data: grammarCheck
        });
      }
      // Parse intent with Rasa
      const intentData = await rasaService.parseIntent(message);
      const detectedIntent = intentData.intent.name;
      
      // Check if the detected intent is expected in the current conversation state
      const expectedIntents = lesson[currentIntent]?.intents || [];
      const validIntent = expectedIntents.includes(detectedIntent);
      
      
      // Get bot response from Rasa
      const botResponse = await rasaService.sendMessage(message, sessionId, {
        lesson_name : lessonName,
        current_intent: currentIntent,
      });
      
      // Get notes and transition information
      const notes = lesson[detectedIntent]?.notes || '';
      const transitionNotes = lesson[detectedIntent]?.transition_notes || '';
      const imageUrl = lesson[detectedIntent]?.imageUrl || "";
      
      // Check if this intent ends the lesson
      const endsLesson = Object.keys(lesson)
        .filter(intent => lesson[intent]?.intents.includes("end"))
        .includes(detectedIntent);
      
      return res.status(200).json({
        success: true,
        type: 'valid_intent',
        data: {
          detectedIntent,
          botResponse,
          notes,
          transitionNotes,
          imageUrl,
          nextIntent: detectedIntent,
          lessonComplete: endsLesson,
          expectedIntents: validIntent ? [] : expectedIntents
        }
      });
  
    } catch (error) {
      console.error('Error processing message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process message'
      });
    }
  }

  /**
   * Check grammar for a message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkGrammar(req, res) {
    try {
      const { text, language } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        });
      }
      const grammarCheck = await grammarService.checkGrammar(text, language || 'en');
      
      return res.status(200).json({
        success: true,
        data: grammarCheck
      });
    } catch (error) {
      console.error('Error checking grammar:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check grammar'
      });
    }
  }

  /**
   * Detect intent of a message without conversation context
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async detectIntent(req, res) {
    try {
      const { message, lessonContext } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }
      
      // Parse intent with Rasa
      const intentData = await rasaService.parseIntent(message);
      
      // Get lesson data if the context was provided
      let lesson = null;
      let expectedIntents = [];
      
      if (lessonContext) {
        try {
          lesson = await LessonModel.getLesson(lessonContext);
          // Get all possible intents in this lesson
          if (lesson) {
            expectedIntents = Object.keys(lesson)
              .filter(key => key !== 'start' && typeof lesson[key] === 'object')
              .map(key => key);
          }
        } catch (err) {
          console.error('Error fetching lesson context:', err);
          // Continue even if lesson fetch fails
        }
      }
      
      // Format response for admin intent checking
      const response = {
        intent: intentData.intent.name,
        confidence: intentData.intent.confidence,
        allIntents: intentData.intent_ranking.map(intent => ({
          intent: intent.name,
          confidence: intent.confidence
        })),
        entities: intentData.entities || [],
        debug: {
          text: message,
          lessonContext,
          expectedIntents,
          rasaResponse: intentData
        }
      };
      
      
      
      return res.status(200).json({
        success: true,
        ...response
      });
    } catch (error) {
      console.error('Error detecting intent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to detect intent',
        error: error.message
      });
    }
  }

  /**
   * Get available intents for a lesson or all intents
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getIntents(req, res) {
    try {
      const { lesson: lessonName } = req.query;
      
      // If lessonName is provided, get intents for that specific lesson
      if (lessonName) {
        const lesson = await LessonModel.getLesson(lessonName);
        
        if (!lesson) {
          return res.status(404).json({
            success: false,
            message: 'Lesson not found'
          });
        }
        
        // Extract intents from lesson object
        const intents = Object.keys(lesson)
          .filter(key => key !== 'start' && typeof lesson[key] === 'object')
          .map(key => ({
            intent_name: key,
            description: lesson[key].notes || '',
            examples: Array.isArray(lesson[key].examples) 
              ? lesson[key].examples.join(', ') 
              : ''
          }));
        
        return res.status(200).json({
          success: true,
          data: intents
        });
      } else {
        // Get all intents from Rasa (if available)
        try {
          const allIntents = await rasaService.getAllIntents();
          return res.status(200).json({
            success: true,
            data: allIntents
          });
        } catch (err) {
          console.error('Error fetching intents from Rasa:', err);
          // Fall back to a simple list from the lessons
          const lessons = await LessonModel.getAllLessons();
          
          // Collect unique intents across all lessons
          const uniqueIntents = new Set();
          const intentsData = [];
          
          lessons.forEach(lesson => {
            Object.keys(lesson)
              .filter(key => key !== 'start' && typeof lesson[key] === 'object')
              .forEach(key => {
                if (!uniqueIntents.has(key)) {
                  uniqueIntents.add(key);
                  intentsData.push({
                    intent_name: key,
                    description: lesson[key].notes || '',
                    examples: Array.isArray(lesson[key].examples) 
                      ? lesson[key].examples.join(', ') 
                      : ''
                  });
                }
              });
          });
          
          return res.status(200).json({
            success: true,
            data: intentsData
          });
        }
      }
    } catch (error) {
      console.error('Error fetching intents:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch intents',
        error: error.message
      });
    }
  }
}

module.exports = new ChatController();