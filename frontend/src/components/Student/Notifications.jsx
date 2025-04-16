import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Notifications = () => {
  const { user, notifications, setNotifications } = useAuth();
  const navigate = useNavigate();
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/notifications/mark-read`, 
        { notificationId }, 
        { withCredentials: true }
      );
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      console.log('[NOTIFICATIONS] Marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClear = async (notificationId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notifications/clear`, 
        { notificationId }, 
        { withCredentials: true }
      );
      setNotifications(response.data.notifications);
      console.log('[NOTIFICATIONS] Cleared:', notificationId);
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const handleClick = (notification) => {
    if (!notification.read) handleMarkAsRead(notification._id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="dashboard-glass rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center text-text-primary">Notifications</h2>
      
      {sortedNotifications.length === 0 ? (
        <div className="text-center py-6 text-text-secondary">
          No notifications available.
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedNotifications.map((notification) => (
            <li 
              key={notification._id} 
              className={`dashboard-glass-light rounded-md p-3 transition-all duration-300 hover:dashboard-glow cursor-pointer ${!notification.read ? 'border-l-4 border-highlight' : ''}`}
              onClick={() => handleClick(notification)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`mb-1 text-text-primary ${!notification.read ? 'font-semibold' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear(notification._id);
                  }}
                  className="text-error hover:text-error/80 transition-all duration-300 text-sm px-2 py-1 rounded hover:bg-secondary-bg"
                >
                  Clear
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;