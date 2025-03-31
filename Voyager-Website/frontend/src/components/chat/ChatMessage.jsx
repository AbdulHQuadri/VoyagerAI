import React from 'react';
import PropTypes from 'prop-types';
import WordDefinition from './WordDefinition';
import { localDictionary } from '../../services/dictionaryService';
import '../../assets/ChatMessage.css'

/**
 * Component for displaying a chat message
 */
const ChatMessage = ({ type, content, imageUrl }) => {

  const userLearningLanguage = "en" // Get this from db later

  // Process bot messages for definitions
  let processedContent = content;
  
  if (type === 'bot' && typeof content === 'string') {

    const languageDictionary = localDictionary[userLearningLanguage] || {};
    // Split content into words while preserving spaces and punctuation
    const tokens = content.split(/(\s+|[,.!?;:()])/);
    
    processedContent = tokens.map((token, index) => {
      // Ignore whitespace and punctuation
      if (/^\s+$/.test(token) || /^[,.!?;:()]+$/.test(token)) {
        return token;
      }
      
      // Check if this word is in our dictionary
      const lowerToken = token.toLowerCase();
      if (languageDictionary[lowerToken]) {
        return (
          <WordDefinition 
            key={index} 
            word={token} 
            definitionData={languageDictionary[lowerToken]} 
          />
        );
      }
      
      return token;
    });
  }
  
  return (
    <div className={`chat-message ${type}`}>
      <div className="message-bubble">
        {type === 'bot' && <span className="bot-avatar"></span>}
        <div className="message-content">
          {processedContent}
          {imageUrl && (
            <div className="message-image-wrapper">
              <img 
                src={imageUrl} 
                alt="Context visual" 
                className="message-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  console.error('Failed to load image:', imageUrl);
                }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  type: PropTypes.oneOf(['user', 'bot']).isRequired,
  content: PropTypes.string.isRequired,
  imageUrl: PropTypes.string
};

export default ChatMessage;