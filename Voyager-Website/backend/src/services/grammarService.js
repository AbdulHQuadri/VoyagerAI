const axios = require('axios');

/**
 * Service to check grammar using the LanguageTool API
 */
class GrammarService {
  /**
   * Check grammar of text
   * @param {string} text - Text to check
   * @param {string} language - Language code (e.g., 'en', 'es')
   * @returns {Promise<Object>} - Grammar check results
   */
  async checkGrammar(text, language = 'en') {
    try {
      // Ensure the correct language format for LanguageTool
      const languageCode = this._getLanguageCode(language);
      
      const params = new URLSearchParams({
        text: text,
        language: languageCode,
        disabledRules: 'WHITESPACE_RULE', // Optional: ignore certain rules
      });

      console.log(`Sending grammar check request for: "${text}"`);
      
      const response = await axios.post(
        'https://api.languagetool.org/v2/check',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 5000 // Add timeout to avoid hanging requests
        }
      );
      
      console.log('Grammar API response:', JSON.stringify(response.data, null, 2));
      
      return this.formatResponse(text, response.data);
    } catch (error) {
      console.error('Grammar check failed:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw new Error('Unable to check grammar at the moment');
    }
  }

  /**
   * Format grammar check response
   * @param {string} originalText - Original text
   * @param {Object} data - Grammar API response
   * @returns {Object} - Formatted grammar check results
   */
  formatResponse(originalText, data) {
    if (!data.matches || data.matches.length === 0) {
      return {
        hasErrors: false,
        message: 'No grammar issues found'
      };
    }

    // Sort matches by offset to process them in order
    const sortedMatches = [...data.matches].sort((a, b) => a.offset - b.offset);
    
    // Apply corrections one by one, adjusting offsets
    let correctedText = originalText;
    let offsetShift = 0;
    
    const issues = sortedMatches.map((error) => {
      const { message, replacements, offset, length } = error;
      
      // Calculate offset with shift from previous corrections
      const adjustedOffset = offset + offsetShift;
      
      // Extract error text from the original text (not the corrected one)
      const errorText = originalText.substring(offset, offset + length);
      
      // Get suggestion if available
      const suggestion = replacements.length > 0 ? replacements[0].value : null;
      
      // Highlight the issue in the original sentence
      const highlighted = `${originalText.substring(0, offset)}[${errorText}]${originalText.substring(offset + length)}`;
      
      // If a replacement is available, update correctedText
      if (suggestion) {
        // Get text before and after the error
        const before = correctedText.substring(0, adjustedOffset);
        const after = correctedText.substring(adjustedOffset + length);
        
        // Create new text with correction
        correctedText = before + suggestion + after;
        
        // Update offset shift for subsequent corrections
        offsetShift += suggestion.length - length;
      }
      
      return {
        error: errorText,
        message,
        suggestion: suggestion || 'No suggestion',
        context: highlighted
      };
    });
    
    return {
      hasErrors: true,
      issues,
      correctedText
    };
  }
  
  /**
   * Convert simple language code to LanguageTool format
   * @param {string} language - Simple language code (e.g., 'en', 'es')
   * @returns {string} - Formatted language code
   */
  _getLanguageCode(language) {
    // Map of language codes to their LanguageTool equivalent
    const languageMap = {
      'en': 'en-US',
      'es': 'es',
      'fr': 'fr',
      'de': 'de-DE',
    };
    
    return languageMap[language] || 'en-US';
  }
}

module.exports = new GrammarService();