import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/AdminPage.css'

// Mock components for each route
// const IntentManagement = () => <h2>Intent Management</h2>;
// const ResponseManagement = () => <h2>Response Management</h2>;
// const LessonBuilder = () => <h2>Lesson Builder</h2>;
// const PersonaManagement = () => <h2>Persona Management</h2>;
// const UserReports = () => <h2>User Reports</h2>;
// const LessonTest = () => <h2>Lesson Test</h2>;
// const DictionaryManagement = () => <h2>Dictionary Management</h2>;
// const SystemSettings = () => <h2>System Settings</h2>;

// NavItem component for sidebar
const NavItem = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`nav-item ${isActive ? 'active' : ''}`}
    >
      {children}
    </Link>
  );
};


// Sidebar component
const Sidebar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3>{collapsed ? 'AD' : 'Admin Dashboard'}</h3>
        <button 
          className="toggle-btn" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="sidebar-nav">
        {children}
      </nav>
    </div>
  );
};

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <Sidebar>
        <NavItem to="/admin/intents">Intent Management</NavItem>
        <NavItem to="/admin/responses">Response Management</NavItem>
        <NavItem to="/admin/lesson-builder">Lesson Builder</NavItem>
        <NavItem to="/admin/personas">Persona Management</NavItem>
        <NavItem to="/admin/reports">User Reports</NavItem>
        <NavItem to="/admin/lesson-test">Lesson Test</NavItem>
        <NavItem to="/admin/dictionary">Dictionary Management</NavItem>
        <NavItem to="/admin/settings">System Settings</NavItem>
      </Sidebar>
      
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="user-controls">
            <span className="username">Admin User</span>
            <button onClick={() => navigate('/')}>Logout</button>
          </div>
        </header>
        
        <div className="content-area">
        {location.pathname === '/admin' && (
          <div className="dashboard-welcome">
            <h2>Welcome to the Admin Dashboard</h2>
            <p>Select a module from the sidebar to get started.</p>
            <div className="quick-actions">
              <button onClick={() => navigate('/admin/lesson-builder')}>
                Create New Lesson
              </button>
              <button onClick={() => navigate('/admin/intent-checker')}>
                Manage Intents
              </button>
              <button onClick={() => navigate('/admin/reports')}>
                View Reports
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage(){
  return (
    <AdminDashboard />
  )
};