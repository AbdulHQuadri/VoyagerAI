const mysql= require('mysql2/promise');
const config = require('../config/db.js')

class LessonModel {
    constructor(){
        this.pool = mysql.createPool(config.database);
    }

    /**
   * Retrieves a complete lesson structure by lesson code
   * @param {string} lessonCode - The unique code for the lesson (e.g., "taxi_to_hotel")
   * @returns {Object} - The complete lesson structure with all stages and intents
   */
  async getLesson(lessonCode) {
    try {
      // Get the lesson details
      const [lessonRows] = await this.pool.execute(
        'SELECT * FROM lessons WHERE lesson_code = ? AND is_active = TRUE',
        [lessonCode]
      );
      
      if (lessonRows.length === 0) {
        return null; // Lesson not found
      }
      
      const lessonId = lessonRows[0].lesson_id;
      
      // Get all stages for this lesson
      const [stageRows] = await this.pool.execute(
        'SELECT * FROM lesson_stages WHERE lesson_id = ? ORDER BY stage_id',
        [lessonId]
      );
      
      // Get all intents for all stages in this lesson
      const [intentRows] = await this.pool.execute(
        `SELECT si.*, ls.stage_code, ls.image_url
         FROM stage_intents si
         JOIN lesson_stages ls ON si.stage_id = ls.stage_id
         WHERE ls.lesson_id = ?`,
        [lessonId]
      );
      
      // Build the lesson structure
      const lesson = {};
      
      // Process each stage
      for (const stage of stageRows) {
        // Find all intents for this stage
        const stageIntents = intentRows
          .filter(intent => intent.stage_id === stage.stage_id)
          .map(intent => intent.intent_code);
        
        // Add the stage to the lesson structure
        lesson[stage.stage_code] = {
          intents: stageIntents,
          notes: stage.notes || "",
          transition_notes: stage.transition_notes || "",
          imageUrl: stage.image_url || "",
        };
        
        // Add persona if it exists and is needed in your frontend
        if (stage.persona) {
          lesson[stage.stage_code].persona = stage.persona;
        }
      }
      
      return lesson;
    } catch (error) {
      console.error('Error retrieving lesson:', error);
      throw new Error('Failed to retrieve lesson');
    }
  }

  /**
   * Retrieves a list of all available lessons with metadata
   * @returns {Array} - Array of lesson objects with metadata
   */
  async getAllLessons() {
    try {
      // Get all active lessons with basic metadata
      const [lessonRows] = await this.pool.execute(
        `SELECT 
          lesson_id, 
          lesson_code as name, 
          title,
          description, 
          language, 
          level as difficulty, 
          category,
          estimated_duration,
          image_url
         FROM lessons 
         WHERE is_active = TRUE
         ORDER BY created_at DESC`
      );
      
      // For each lesson, get the stage count (optional but useful metadata)
      const lessonsWithMetadata = await Promise.all(
        lessonRows.map(async (lesson) => {
          const [stageCountResult] = await this.pool.execute(
            'SELECT COUNT(*) as stage_count FROM lesson_stages WHERE lesson_id = ?',
            [lesson.lesson_id]
          );
          
          return {
            ...lesson,
            stage_count: stageCountResult[0].stage_count,
            // Removing lesson_id as it's not needed in the response
            lesson_id: undefined
          };
        })
      );
      
      return lessonsWithMetadata;
    } catch (error) {
      console.error('Error retrieving all lessons:', error);
      throw new Error('Failed to retrieve lessons');
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }

}

module.exports = new LessonModel();

