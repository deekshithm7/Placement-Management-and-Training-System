const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getNotifications,
  markNotificationAsRead,
  clearNotification,
  sendBranchNotification,
} = require('../controllers/notificationController');


const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');

// Get user's notifications (Any authenticated user)
router.get('/', isAuthenticated, getNotifications);
// Send notification to specific users (Coordinator/Advisor only)
router.post('/send', isAuthenticated, checkRole(['Coordinator', 'Advisor']), sendNotification);

// Send notification to all students in advisor's branch (Advisor only)
router.post('/branch', isAuthenticated, checkRole(['Advisor']), sendBranchNotification);



// Mark notification as read (Any authenticated user)
router.post('/mark-read', isAuthenticated, markNotificationAsRead);

// Clear notification (Any authenticated user)
router.post('/clear', isAuthenticated, clearNotification);

module.exports = router;