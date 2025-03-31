// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const getDb = () => global.db;
// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Check if user has admin role (assuming you have a role field in your token)
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
}

/**
 * @route    GET /api/admin/reports/metrics/summary
 * @desc     Get report metrics for dashboard
 * @access   Admin only
 */
router.get('/reports/metrics/summary', authenticateToken, async (req, res) => {
  try {
    // Get reports by status
    const db = getDb();
    const [statusCounts] = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM reports 
      GROUP BY status
    `);
    
    // Get reports by type
    const [typeCounts] = await db.execute(`
      SELECT report_type, COUNT(*) as count 
      FROM reports 
      GROUP BY report_type
    `);
    
    // Get reports created in the last 30 days
    const [recentCount] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM reports 
      WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    // Get average resolution time
    const [avgResolutionTime] = await db.execute(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, reported_at, resolved_at)) as avg_hours
      FROM reports
      WHERE status = 'resolved' AND resolved_at IS NOT NULL
    `);
    
    res.json({
      byStatus: statusCounts,
      byType: typeCounts,
      recentCount: recentCount[0]?.count || 0,
      avgResolutionTime: avgResolutionTime[0]?.avg_hours || 0
    });
  } catch (error) {
    console.error('Error fetching report metrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route    PUT /api/admin/reports/:id/resolve
 * @desc     Resolve or update the status of a report
 * @access   Admin only
 */
router.put('/reports/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const reportId = req.params.id;
    const { status, resolution } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate that report exists
    const [reports] = await db.execute(
      `SELECT * FROM reports WHERE report_id = ?`,
      [reportId]
    );
    
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    let query = `
      UPDATE reports 
      SET status = ?,
          resolved_by = ?
    `;
    
    const params = [status, req.user.id];
    
    // Add resolution notes if provided
    if (resolution) {
      query += `, description = CONCAT(description, '\n\nRESOLUTION: ', ?)`;
      params.push(resolution);
    }
    
    // If status is 'resolved', set resolved_at timestamp
    if (status === 'resolved') {
      query += `, resolved_at = NOW()`;
    }
    
    query += ` WHERE report_id = ?`;
    params.push(reportId);
    
    await db.execute(query, params);
    
    res.json({ 
      message: 'Report updated successfully',
      reportId: reportId,
      status: status
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route    GET /api/admin/reports/:id
 * @desc     Get a single report by ID
 * @access   Admin only
 */
router.get('/reports/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const reportId = req.params.id;
    
    const [reports] = await db.execute(
      `SELECT * FROM reports WHERE report_id = ?`,
      [reportId]
    );
    
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(reports[0]);
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route    GET /api/admin/reports
 * @desc     Get all reports with optional filtering
 * @access   Admin only
 */
router.get('/reports', async (req, res) => {
  try {
    const db = getDb();
    const { status, reportType, dateRange } = req.query;
    
    let query = `
      SELECT 
        report_id, 
        user_id,
        lesson_id,
        stage_code,
        user_message,
        bot_response,
        report_type,
        description,
        status,
        reported_at,
        resolved_at,
        resolved_by
      FROM reports
    `;
    
    const queryParams = [];
    const conditions = [];
    
    // Add filters if provided
    if (status && status !== 'all') {
      conditions.push('status = ?');
      queryParams.push(status);
    }
    
    if (reportType && reportType !== 'all') {
      conditions.push('report_type = ?');
      queryParams.push(reportType);
    }
    
    if (dateRange && dateRange !== 'all') {
      let dateCondition;
      
      switch (dateRange) {
        case 'today':
          dateCondition = 'DATE(reported_at) = CURDATE()';
          break;
        case 'week':
          dateCondition = 'reported_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateCondition = 'reported_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
          break;
      }
      
      if (dateCondition) {
        conditions.push(dateCondition);
      }
    }
    
    // Add WHERE clause if any conditions exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Order by most recent reports first
    query += ' ORDER BY reported_at DESC';
    
    const [results] = await db.execute(query, queryParams);
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;