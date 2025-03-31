import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import chatService from '../services/chatService';
import lessonService from '../services/lessonService';

/**
 * Custom hook for managing chat functionality
 * @param {string} lessonName - Name of the lesson
 * @returns {Object} - Chat state and functions
 */
const useChat = (lessonName) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIntent, setCurrentIntent] = useState('start');
  const [lesson, setLesson] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId] = useState(() => uuidv4()); // Generate unique session ID

  // Fetch lesson data when component mounts
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonName) return;
      
      try {
        setLoading(true);
        const data = await lessonService.getLesson(lessonName);
        setLesson(data);
        console.log(data);
        
        // Initialize messages with start notes and transition
        if (data?.start) {
          const startMessages = [];
          
          if (data.start.notes) {
            startMessages.push({
              type: 'note',
              content: data.start.notes,
              id: uuidv4()
            });
          }
          
          if (data.start.transition_notes) {
            startMessages.push({
              type: 'transition',
              content: data.start.transition_notes,
              id: uuidv4()
            });
          }
          
          setMessages(startMessages);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load lesson');
        console.error('Error loading lesson:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [lessonName]);

  /**
   * Send a message to the chat
   * @param {string} message - User's message
   */
  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || !lessonName || !currentIntent) return;
    
    try {
      setLoading(true);
      
      // First, check for grammar errors
      console.log(`Checking grammar for: "${message}"`);
      const grammarCheckResponse = await chatService.checkGrammar(message);
      console.log('Grammar check response:', grammarCheckResponse);
      
      // If there are grammar errors, show them but don't proceed with the message
      if (grammarCheckResponse && grammarCheckResponse.data.hasErrors) {
        console.log('Grammar errors found:', grammarCheckResponse.data.issues);
        // Add user message to chat
        setMessages(prev => [
          ...prev,
          {
            type: 'user',
            content: message,
            id: uuidv4()
          }
        ]);
        
        // Add grammar error message
        console.log('Adding grammar message to state: ');

        setMessages(prev => [
          ...prev,
          {
            type: 'grammar',
            content: {
              issues: grammarCheckResponse.data.issues || [],
              correctedText: grammarCheckResponse.data.correctedText || message
            },
            id: uuidv4()
          }
        ]);
        
        
        setLoading(false);
        return; // Don't proceed with sending the message
      }
      
      // Add user message to chat
      setMessages(prev => [
        ...prev,
        {
          type: 'user',
          content: message,
          id: uuidv4()
        }
      ]);
      
      // Process message with backend
      const response = await chatService.processMessage({
        message,
        lessonName,
        currentIntent,
        sessionId
      });
      
      // Handle different response types
      
      const { botResponse, notes, transitionNotes, nextIntent, lessonComplete, imageUrl } = response.data;
      
      // Add bot response
      if (botResponse && botResponse.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            content: botResponse[0].text,
            imageUrl: imageUrl,
            id: uuidv4()
          }
        ]);
      }
      
      // Add cultural/stage note if available
      if (notes) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              type: 'note',
              content: notes,
              id: uuidv4()
            }
          ]);
        }, 500);
      }
      
      // Add transition note if available
      if (transitionNotes) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              type: 'transition',
              content: transitionNotes,
              id: uuidv4()
            }
          ]);
        }, 1000);
      }
      
      // Update current intent
      if (nextIntent) {
        setCurrentIntent(nextIntent);
      }
      
      // Check if lesson is complete
      if (lessonComplete) {
        setIsComplete(true);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              type: 'system',
              content: 'Lesson completed! 🎉',
              id: uuidv4()
            }
          ]);
        }, 1500);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          type: 'error',
          content: 'Error: Could not reach server',
          id: uuidv4()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [lessonName, currentIntent, sessionId]);

  /**
   * Reset the chat to initial state
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentIntent('start');
    setIsComplete(false);
    
    // Re-initialize with start messages
    if (lesson?.start) {
      const startMessages = [];
      
      if (lesson.start.notes) {
        startMessages.push({
          type: 'note',
          content: lesson.start.notes,
          id: uuidv4()
        });
      }
      
      if (lesson.start.transition_notes) {
        startMessages.push({
          type: 'transition',
          content: lesson.start.transition_notes,
          id: uuidv4()
        });
      }
      
      setMessages(startMessages);
    }
  }, [lesson]);

  return {
    messages,
    loading,
    error,
    currentIntent,
    isComplete,
    sendMessage,
    resetChat
  };
};

export default useChat;