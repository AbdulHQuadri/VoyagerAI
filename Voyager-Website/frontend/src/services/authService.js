// src/services/authService.js
import api from './api';

/**
 * Service for authentication-related API calls
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - API response with token and user info
   */
  register: async (userData) => {
    try {
      const response = await api.post('/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} - API response with token and user info
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  /**
   * Get current user data
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/user-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },
  
  /**
   * Store authentication data in localStorage
   * @param {string} token - JWT token
   * @param {Object} userData - User data
   */
  setAuthData: (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  /**
   * Remove authentication data from localStorage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get user data from localStorage
   * @returns {Object|null} - User data or null
   */
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService;