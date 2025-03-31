import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import { v4 as uuidv4 } from 'uuid';
import '../../assets/IntentChecker.css';

const IntentChecker = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [availableLessons, setAvailableLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  // Fetch available lessons when component mounts
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoadingLessons(true);
        // Rwplace later with actual API calls, but for testing hard coded lessons here
        const lessons = [
          { id: 'greeting', name: 'Basic Greetings' },
          { id: 'food_ordering', name: 'Food Ordering' },
          { id: 'directions', name: 'Asking for Directions' },
          { id: 'shopping', name: 'Shopping Conversations' },
          { id: 'travel', name: 'Travel Phrases' }
        ];
        
        setAvailableLessons(lessons);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load available lessons');
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (!selectedLesson) {
      setError('Please select a lesson context');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Make a checkIntent function instead of the sendMessage for better SOC
      const response = await chatService.checkIntent(input, selectedLesson);
      setResult(response);
    } catch (err) {
      console.error('Intent detection error:', err);
      setError('Failed to detect intent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  const formatConfidence = (confidence) => {
    if (typeof confidence === 'number') {
      return (confidence * 100).toFixed(2) + '%';
    }
    return 'N/A';
  };

  return (
    <div className="intent-checker-container">
      <h2>Intent Checker</h2>
      <p className="description">
        Test your bot's intent recognition by entering a message below. This tool helps you understand 
        how your bot interprets user inputs in different lesson contexts.
      </p>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <form onSubmit={handleSubmit} className="intent-form">
        <div className="form-group">
          <label htmlFor="lesson-select">Lesson Context:</label>
          <select 
            id="lesson-select"
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            required
            disabled={loadingLessons}
          >
            <option value="">Select a lesson</option>
            {availableLessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {loadingLessons && <div className="loading-indicator">Loading lessons...</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="message-input">Message:</label>
          <textarea
            id="message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a message to check its intent..."
            rows={4}
            disabled={loading}
            required
          />
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            className="check-button" 
            disabled={loading || loadingLessons}
          >
            {loading ? 'Checking...' : 'Check Intent'}
          </button>
          <button 
            type="button" 
            className="clear-button" 
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
      
      {result && (
        <div className="result-container">
          <h3>Intent Detection Results</h3>
          
          <div className="result-summary">
            <div className="detected-intent">
              <span className="label">Detected Intent:</span>
              <span className="value">{result.intent || 'Unknown'}</span>
            </div>
            
            <div className="confidence">
              <span className="label">Confidence:</span>
              <span className="value">{formatConfidence(result.confidence)}</span>
            </div>
          </div>
          
          {result.allIntents && result.allIntents.length > 0 && (
            <div className="all-intents">
              <h4>All Detected Intents</h4>
              <table className="intents-table">
                <thead>
                  <tr>
                    <th>Intent</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.allIntents.map((item, index) => (
                    <tr key={index} className={item.intent === result.intent ? 'selected-intent' : ''}>
                      <td>{item.intent}</td>
                      <td>{formatConfidence(item.confidence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {result.entities && result.entities.length > 0 && (
            <div className="entities">
              <h4>Extracted Entities</h4>
              <table className="entities-table">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Value</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.entities.map((entity, index) => (
                    <tr key={index}>
                      <td>{entity.entity}</td>
                      <td>{entity.value}</td>
                      <td>{formatConfidence(entity.confidence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {result.debug && (
            <div className="debug-info">
              <h4>Debug Information</h4>
              <pre>{JSON.stringify(result.debug, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntentChecker;