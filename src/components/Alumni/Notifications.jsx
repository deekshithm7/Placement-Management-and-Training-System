import React from 'react';
import PropTypes from 'prop-types';
import gcek from '../../assets/gcek-transparent.png';
import bgPattern from '../../assets/bg-pattern.jpg';

const Notifications = ({ notifications = [], markAsRead, clearAllNotifications }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-950 text-gray-100">
      <div
        className="lg:w-2/5 hidden lg:flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundColor: '#1A1A2E',
        }}
      >
        <img
          src={gcek}
          alt="GCEK Logo"
          className="w-3/4 max-w-xs h-auto mb-4 drop-shadow-md"
        />
        <h2 className="text-xl font-poppins font-bold text-gray-100 text-center">Stay Updated</h2>
        <p className="text-sm font-poppins font-light text-gray-400 text-center mt-1">
          Check your notifications.
        </p>
      </div>

      <div className="lg:w-3/5 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        <div className="bg-gray-950/95 rounded-lg shadow-md border border-gray-800 p-4 sm:p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-poppins font-bold text-gray-100">Notifications</h1>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-gray-400 hover:text-gray-300 text-sm font-poppins font-medium transition-all duration-200 bg-gray-900 rounded-full px-3 py-1"
              >
                Clear All
              </button>
            )}
          </div>
          <ul className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm font-poppins font-light text-gray-400 text-center">No notifications available.</p>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-3 rounded-lg border border-gray-800/50 shadow-sm ${
                    n.read ? 'bg-gray-900' : 'bg-gray-925 hover:bg-gray-900'
                  } flex justify-between items-center transition-all duration-200`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${n.read ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                    <div>
                      <h3 className="text-sm font-poppins font-semibold text-gray-100">{n.type}</h3>
                      <p className="text-xs font-poppins font-light text-gray-400">{n.message}</p>
                      <p className="text-xs font-poppins font-light text-gray-500 mt-1">{n.timestamp}</p>
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-gray-400 hover:text-gray-300 text-xs font-poppins font-medium transition-all duration-200 bg-gray-900 rounded-full px-2 py-0.5"
                      aria-label={`Mark notification ${n.id} as read`}
                    >
                      Mark Read
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

Notifications.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
    })
  ),
  markAsRead: PropTypes.func.isRequired,
  clearAllNotifications: PropTypes.func.isRequired,
};

export default Notifications;