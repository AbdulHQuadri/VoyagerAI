// src/services/reportsService.js
import api from './api';

/**
 * Service module for handling report-related API calls
 */
const reportsService = {
  /**
   * Get all reports with optional filtering
   * @param {Object} filters - Filter parameters
   * @param {string} filters.status - Filter by status (pending, in_progress, resolved, all)
   * @param {string} filters.reportType - Filter by report type
   * @param {string} filters.dateRange - Filter by date range (today, week, month, all)
   * @returns {Promise} - Promise with reports data
   */
  getReports: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.reportType && filters.reportType !== 'all') {
      params.append('reportType', filters.reportType);
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      params.append('dateRange', filters.dateRange);
    }
    
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  /**
   * Get a single report by ID
   * @param {number} reportId - The ID of the report to retrieve
   * @returns {Promise} - Promise with report data
   */
  getReportById: async (reportId) => {
    const response = await api.get(`/admin/reports/${reportId}`);
    return response.data;
  },

  /**
   * Update a report's status
   * @param {number} reportId - The ID of the report to update
   * @param {string} status - New status (in_progress, resolved)
   * @param {string} resolution - Optional resolution notes
   * @returns {Promise} - Promise with update confirmation
   */
  updateReportStatus: async (reportId, status, resolution = '') => {
    const response = await api.put(`/admin/reports/${reportId}/resolve`, {
      status,
      resolution
    });
    return response.data;
  },

  /**
   * Get report metrics for dashboard
   * @returns {Promise} - Promise with metrics data
   */
  getReportMetrics: async () => {
    const response = await api.get('/admin/reports/metrics/summary');
    return response.data;
  }
};

export default reportsService;