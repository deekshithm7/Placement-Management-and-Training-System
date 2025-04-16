const User = require('../models/User');
const PlacementDrive = require('../models/PlacementDrive'); // Optional, for relatedId usage

// Helper function to send email notifications (reusing your existing logic)
const sendEmail = async (recipient, subject, content) => {
  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: process.env.BREVO_EMAIL, name: 'PMTS System' },
        to: [{ email: recipient }],
        subject,
        htmlContent: content,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[EMAIL] Notification email sent to: ${recipient}`);
    return response.data;
  } catch (error) {
    console.error('[EMAIL ERROR]', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

// Send notification to users (Admin-only: Coordinator/Advisor)
exports.sendNotification = async (req, res) => {
  const { userIds, message, type, link, relatedId } = req.body;

  try {
    // Validate input
    if (!message || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Message and userIds (array) are required' });
    }

    // Update users with new notification
    const users = await User.updateMany(
      { _id: { $in: userIds } },
      {
        $push: {
          notifications: {
            message,
            type: type || 'info',
            link: link || null,
            relatedId: relatedId || null,
          },
        },
      }
    );

    if (users.modifiedCount === 0) {
      return res.status(404).json({ message: 'No users found or updated' });
    }

    // Fetch updated users for email notification
    const updatedUsers = await User.find({ _id: { $in: userIds } });
    const emailPromises = updatedUsers.map(user =>
      sendEmail(
        user.email,
        'New Notification from PMTS',
        `
          <h2>New Notification</h2>
          <p>${message}</p>
          ${link ? `<p><a href="${link}" style="color: #2D89FF;">Click here to view</a></p>` : ''}
          <p>Thank you,<br>PMTS Team</p>
        `
      )
    );
    await Promise.all(emailPromises);

    console.log(`[SEND-NOTIFICATION] Sent to ${users.modifiedCount} users: ${message}`);
    res.json({ message: 'Notifications sent successfully', affectedUsers: users.modifiedCount });
  } catch (error) {
    console.error('[SEND-NOTIFICATION ERROR]', error.message);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};

// Fetch user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ notifications: user.notifications });
  } catch (error) {
    console.error('[FETCH-NOTIFICATIONS ERROR]', error.message);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.body;

  try {
    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notification = user.notifications.id(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await user.save();

    console.log(`[MARK-NOTIFICATION-READ] User: ${user.email}, Notification: ${notificationId}`);
    res.json({ message: 'Notification marked as read', notifications: user.notifications });
  } catch (error) {
    console.error('[MARK-NOTIFICATION-READ ERROR]', error.message);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Clear a notification
exports.clearNotification = async (req, res) => {
  const { notificationId } = req.body;

  try {
    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $pull: { notifications: { _id: notificationId } } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User or notification not found' });

    console.log(`[CLEAR-NOTIFICATION] User: ${user.email}, Notification: ${notificationId}`);
    res.json({ message: 'Notification cleared', notifications: user.notifications });
  } catch (error) {
    console.error('[CLEAR-NOTIFICATION ERROR]', error.message);
    res.status(500).json({ message: 'Error clearing notification', error: error.message });
  }
};

// Optional: Send bulk notification to all students in a branch (Advisor-specific)
exports.sendBranchNotification = async (req, res) => {
  const { message, type, link, relatedId } = req.body;
  const advisorBranch = req.user.branch;

  try {
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Find all students in the advisor's branch
    const students = await User.find({ role: 'Student', branch: advisorBranch });
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in your branch' });
    }

    // Update all students with the notification
    const result = await User.updateMany(
      { role: 'Student', branch: advisorBranch },
      {
        $push: {
          notifications: {
            message,
            type: type || 'info',
            link: link || null,
            relatedId: relatedId || null,
          },
        },
      }
    );

    // Send email notifications
    const emailPromises = students.map(student =>
      sendEmail(
        student.email,
        'New Branch Notification from PMTS',
        `
          <h2>New Notification</h2>
          <p>${message}</p>
          ${link ? `<p><a href="${link}" style="color: #2D89FF;">Click here to view</a></p>` : ''}
          <p>Thank you,<br>PMTS Team</p>
        `
      )
    );
    await Promise.all(emailPromises);

    console.log(`[SEND-BRANCH-NOTIFICATION] Sent to ${result.modifiedCount} students in branch ${advisorBranch}: ${message}`);
    res.json({ message: 'Branch notification sent successfully', affectedStudents: result.modifiedCount });
  } catch (error) {
    console.error('[SEND-BRANCH-NOTIFICATION ERROR]', error.message);
    res.status(500).json({ message: 'Failed to send branch notification', error: error.message });
  }
};