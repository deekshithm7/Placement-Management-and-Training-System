const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware'); // Updated import

// Main dashboard analytics endpoint
router.post('/dashboard', isAuthenticated, checkRole(['Coordinator']), analyticsController.getDashboardAnalytics);

// Company-specific analytics
router.post('/companies', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Fetch company performance analytics
    const companies = await analyticsController.getCompanyPerformanceAnalytics(startDate, endDate);
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    res.status(500).json({ error: 'Failed to generate company analytics data' });
  }
});

// Student performance analytics
router.post('/students', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;
    
    // Fetch student performance analytics
    const students = await analyticsController.getStudentPerformanceAnalytics(startDate, endDate, filters);
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ error: 'Failed to generate student analytics data' });
  }
});

// Test analytics endpoint
router.post('/tests', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { startDate, endDate, testIds } = req.body;
    
    // Fetch test analytics
    const testAnalytics = await analyticsController.getTestAnalytics(startDate, endDate, testIds);
    
    res.json(testAnalytics);
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ error: 'Failed to generate test analytics data' });
  }
});

// Department/Branch-wise analytics
router.post('/departments', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Fetch department-wise placement analytics
    const departments = await analyticsController.getDepartmentAnalytics(startDate, endDate);
    
    res.json(departments);
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({ error: 'Failed to generate department analytics data' });
  }
});

// Export analytics as CSV/Excel
router.post('/export', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { type, startDate, endDate, filters } = req.body;
    
    // Generate and send analytics export
    await analyticsController.exportAnalytics(req, res, type, startDate, endDate, filters);
    
    // Response is handled in the controller as it streams the file
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

// Filter options for analytics dashboard
router.get('/filters', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    // Fetch all available filter options
    const filters = await analyticsController.getAnalyticsFilterOptions();
    
    res.json(filters);
  } catch (error) {
    console.error('Error fetching analytics filters:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

module.exports = router;