import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useChat from '../hooks/useChat';

// Import components
import ChatMessage from '../components/chat/ChatMessage';
import StageNote from '../components/chat/StageNote';

import '../assets/ChatPage.css';


function ChatPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonName = searchParams.get('lesson');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  // Use the custom chat hook
  const { 
    messages, 
    loading, 
    error, 
    currentIntent, 
    isComplete, 
    sendMessage,
    resetChat 
  } = useChat(lessonName);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    await sendMessage(input);
    setInput('');
  };

  // Handle navigation
  const handleBack = () => {
    navigate('/');
  };

  // Handle restart lesson
  const handleRestart = () => {
    resetChat();
  };

  if (!lessonName) {
    return (
      <div className="chat-page error-container">
        <h1>Error</h1>
        <p>No lesson selected. Please choose a valid lesson.</p>
        <button onClick={handleBack}>Back to Lessons</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page error-container">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={handleBack}>Back to Lessons</button>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button onClick={handleBack} className="back-button">Back</button>
        <h1>Chat Practice</h1>
        <button onClick={handleRestart} className="restart-button">Restart</button>
      </header>

      <div className="chatbox">
        <div className="messages">
          {messages.map((msg) => {
            switch (msg.type) {
              case 'user':
                return <ChatMessage key={msg.id} type="user" content={msg.content} />;
              case 'bot':
                  return <ChatMessage key={msg.id} type="bot" content={msg.content} imageUrl={msg.imageUrl}/>;
              case 'note':
                return <StageNote key={msg.id} type="note" content={msg.content} />;
              case 'transition':
                return <StageNote key={msg.id} type="transition" content={msg.content} />;
              case 'grammar':
                 return <StageNote key={msg.id} type="grammar" content={msg.content} />;
              case 'system':
                return <StageNote key={msg.id} type="system" content={msg.content} />;
              case 'error':
                return <StageNote key={msg.id} type="error" content={msg.content} />;
              default:
                return null;
            }
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            disabled={loading || isComplete}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={loading || isComplete}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;