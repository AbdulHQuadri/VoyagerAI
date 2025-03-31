import './App.css'
import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import LessonEditor from './pages/LessonEditor'
import Auth from './components/Authentication/Authentication'
import Reports from './components/Admin/Reports'
import IntentChecker from './components/Admin/IntentChecker'

/**
 * Main application component with routing configuration
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  
  // Function to handle successful login
  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} onLogout={handleLogout} />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <Auth isLogin={true} onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <Auth isLogin={false} onLoginSuccess={handleLoginSuccess} />
            } 
          />
          {/* Protected routes */}
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? 
              <ChatPage /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? 
              <AdminPage /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin/lesson-builder" 
            element={
              isAuthenticated ? 
              <LessonEditor /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin/intent-checker" 
            element={
              isAuthenticated ? 
              <IntentChecker /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              isAuthenticated ? 
              <Reports /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
