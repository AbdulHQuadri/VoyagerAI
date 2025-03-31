import React from 'react';
import './StageNote.css'; // Make sure to create corresponding CSS

/**
 * Component for displaying various types of stage notes in the chat
 * @param {Object} props - Component props
 * @param {string} props.type - Type of note (note, transition, grammar, system, error)
 * @param {any} props.content - Content of the note (string or object depending on type)
 * @returns {React.Component} Stage note component
 */
const StageNote = ({ type, content }) => {
  // Helper function to determine CSS class based on note type
  const getNoteClass = () => {
    switch (type) {
      case 'note':
        return 'stage-note note';
      case 'transition':
        return 'stage-note transition';
      case 'grammar':
        return 'stage-note grammar';
      case 'system':
        return 'stage-note system';
      case 'error':
        return 'stage-note error';
      default:
        return 'stage-note';
    }
  };

  // Render different content based on note type
  const renderContent = () => {
    switch (type) {
      case 'grammar':
        // Make sure content has the expected structure
        if (!content || !content.issues) {
          console.error('Grammar note missing required structure:', content);
          return <p>Invalid grammar note format</p>;
        }
        
        return (
          <>
            <h3>Grammar Check</h3>
            <div className="grammar-issues">
              {content.issues.map((issue, idx) => (
                <div key={idx} className="grammar-issue">
                  <p><strong>Issue:</strong> "{issue.error}" → {issue.message}</p>
                  <p><strong>Suggestion:</strong> "{issue.suggestion}"</p>
                  <p><strong>Context:</strong> {issue.context}</p>
                </div>
              ))}
            </div>
            <p><strong>Corrected:</strong> {content.correctedText}</p>
          </>
        );
      
      case 'system':
      case 'error':
        return (
          <div className="system-message">
            <p>{content}</p>
          </div>
        );
      
      case 'note':
      case 'transition':
      default:
        return <p>{content}</p>;
    }
  };

  return (
    <div className={getNoteClass()}>
      {type === 'system' && <span className="system-icon">💬System</span>}
      {type === 'error' && <span className="error-icon">⚠️Error</span>}
      {type === 'note' && <span className="note-icon">📝Note</span>}
      {type === 'transition' && <span className="transition-icon">➡️</span>}
      {type === 'grammar' && <span className="grammar-icon">✏️</span>}
      
      <div className="note-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default StageNote;