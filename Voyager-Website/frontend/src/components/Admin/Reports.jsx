import React, { useState, useEffect } from 'react';
import reportsService from '../../services/reportService.js';
import '../../assets/Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: 'all',
    reportType: 'all',
    dateRange: 'all'
  });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const reports = await reportsService.getReports({
        status: filter.status,
        reportType: filter.reportType,
        dateRange: filter.dateRange
      });
      
      setReports(Array.isArray(reports) ? reports : []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      
      // Handle specific error cases
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('You must be logged in to view reports');
        } else if (err.response.status === 403) {
          setError('You do not have permission to view reports');
        } else {
          setError(`Failed to load reports: ${err.response.data?.message || 'Server error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Failed to reach the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, resolution) => {
    try {
      setError(null); // Clear previous errors
      
      await reportsService.updateReportStatus(reportId, 'resolved', resolution);
      
      // Refresh reports after resolution
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error('Error resolving report:', err);
      
      if (err.response && err.response.data?.message) {
        setError(`Failed to resolve report: ${err.response.data.message}`);
      } else {
        setError('Failed to resolve report. Please try again later.');
      }
    }
  };
  
  const handleInProgressReport = async (reportId, notes) => {
    try {
      setError(null); // Clear previous errors
      
      await reportsService.updateReportStatus(reportId, 'in_progress', notes);
      
      // Refresh reports after status update
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error('Error updating report status:', err);
      
      if (err.response && err.response.data?.message) {
        setError(`Failed to update report: ${err.response.data.message}`);
      } else {
        setError('Failed to update report status. Please try again later.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
  };

  // Retry functionality if loading fails
  const handleRetry = () => {
    fetchReports();
  };

  return (
    <div className="reports-container">
      <h2>User Reports</h2>
      
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filter.status} 
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Report Type:</label>
          <select 
            value={filter.reportType} 
            onChange={(e) => setFilter({...filter, reportType: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="incorrect_response">Incorrect Response</option>
            <option value="offensive_content">Offensive Content</option>
            <option value="technical_issue">Technical Issue</option>
            <option value="content_issue">Content Issue</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <select 
            value={filter.dateRange} 
            onChange={(e) => setFilter({...filter, dateRange: e.target.value})}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-text">{error}</div>
          <button className="retry-button" onClick={handleRetry}>Retry</button>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="no-reports">No reports found.</div>
      ) : (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Lesson</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reported At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.report_id}>
                  <td>{report.report_id}</td>
                  <td>{report.user_id}</td>
                  <td>{report.lesson_id}</td>
                  <td>{report.report_type}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{formatDate(report.reported_at)}</td>
                  <td>
                    <button 
                      className="view-button"
                      onClick={() => handleViewDetails(report)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="report-details-overlay">
          <div className="report-details-modal">
            <h3>Report Details</h3>
            <button className="close-button" onClick={handleCloseDetails}>×</button>
            
            <div className="report-details-content">
              <div className="detail-group">
                <label>Report ID:</label>
                <span>{selectedReport.report_id}</span>
              </div>
              
              <div className="detail-group">
                <label>User ID:</label>
                <span>{selectedReport.user_id}</span>
              </div>
              
              <div className="detail-group">
                <label>Lesson ID:</label>
                <span>{selectedReport.lesson_id}</span>
              </div>
              
              <div className="detail-group">
                <label>Stage Code:</label>
                <span>{selectedReport.stage_code || 'N/A'}</span>
              </div>
              
              <div className="detail-group">
                <label>Report Type:</label>
                <span>{selectedReport.report_type}</span>
              </div>
              
              <div className="detail-group">
                <label>Status:</label>
                <span className={`status-badge ${getStatusClass(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>
              
              <div className="detail-group">
                <label>Reported At:</label>
                <span>{formatDate(selectedReport.reported_at)}</span>
              </div>
              
              <div className="detail-group">
                <label>Resolved At:</label>
                <span>{formatDate(selectedReport.resolved_at)}</span>
              </div>
              
              <div className="detail-group">
                <label>Resolved By:</label>
                <span>{selectedReport.resolved_by || 'N/A'}</span>
              </div>
              
              <div className="detail-group full-width">
                <label>Description:</label>
                <p className="description-text">{selectedReport.description}</p>
              </div>
              
              <div className="conversation-context">
                <h4>Conversation Context</h4>
                <div className="message user-message">
                  <div className="message-header">User:</div>
                  <div className="message-content">{selectedReport.user_message}</div>
                </div>
                <div className="message bot-message">
                  <div className="message-header">Bot:</div>
                  <div className="message-content">{selectedReport.bot_response}</div>
                </div>
              </div>
              
              {selectedReport.status !== 'resolved' && (
                <div className="resolution-form">
                  <h4>Resolve Report</h4>
                  <textarea 
                    id="resolution-notes" 
                    placeholder="Enter resolution notes..."
                    rows="4"
                  ></textarea>
                  <div className="resolution-actions">
                    <button 
                      className="resolve-button"
                      onClick={() => {
                        const notes = document.getElementById('resolution-notes').value;
                        handleResolveReport(selectedReport.report_id, notes);
                      }}
                    >
                      Mark as Resolved
                    </button>
                    <button 
                      className="in-progress-button"
                      onClick={() => {
                        const notes = document.getElementById('resolution-notes').value;
                        handleInProgressReport(selectedReport.report_id, notes);
                      }}
                    >
                      Mark as In Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;