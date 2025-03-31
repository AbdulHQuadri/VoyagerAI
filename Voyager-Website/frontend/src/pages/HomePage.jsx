import ChatButton from "../components/ChatButton";
import { Link } from "react-router-dom"; 
import '../assets/HomePage.css';
import LessonCards from "../components/LessonCard";

function HomePage({ isAuthenticated, onLogout }) {
  return (
    <div className="homepage">
      {/* Header with auth buttons */}
      <header className="home-header">
        <h1 className="app-title">Voyager</h1>
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/chat" className="btn chat-btn">Start Chatting</Link>
              <button onClick={onLogout} className="btn logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn login-btn">Login</Link>
              <Link to="/register" className="btn register-btn">Register</Link>
            </>
          )}
        </div>
      </header>
      
      <div className="main-content">
        <div className="welcome-section">
          <h1>Welcome to Language Learning</h1>
          <p>Practice real-world conversations in different scenarios</p>
        </div>
       
        <div className="lesson-section">
          {isAuthenticated ? (
            <LessonCards />
          ) : (
            <div className="auth-cta">
              <p>Sign in to start practicing languages with our interactive chatbot</p>
              <Link to="/register" className="btn register-cta">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;