import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // Memoize fetchNotifications to prevent recreation
  const fetchNotifications = useCallback(async () => {
    if (!user) return; // Skip if no user
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, { withCredentials: true });
      setNotifications(response.data.notifications);
      console.log('[NOTIFICATIONS] Fetched:', response.data.notifications.length, new Date().toISOString());
    } catch (error) {
      console.error('[NOTIFICATIONS] Error fetching:', error.response?.data.message || error.message);
      setNotifications([]);
    }
  }, [user, API_BASE_URL]); // Dependencies: user and API_BASE_URL

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/status`, { withCredentials: true });
        if (res.data.isAuthenticated) {
          setUser({
            email: res.data.user.email,
            name: res.data.user.name,
            batch: res.data.user.batch || null, // Ensure batch is included
            branch: res.data.user.branch || null, // Add branch, fallback to null if not present
          });
          setRole(res.data.user.role);
          console.log('[AUTH] User authenticated:', res.data.user.email, res.data.user.role, {
            batch: res.data.user.batch,
            branch: res.data.user.branch,
          });
        }
      } catch (error) {
        console.error('[AUTH] No user authenticated:', error.response?.data.message || error.message);
        setUser(null);
        setRole(null);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [API_BASE_URL]);

  // Polling for notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications(); // Initial fetch
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // Every 60 seconds

    return () => {
      console.log('[NOTIFICATIONS] Cleaning up interval:', intervalId);
      clearInterval(intervalId);
    };
  }, [user, fetchNotifications]); // Only re-run if user or fetchNotifications changes

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser({
        email: res.data.user.email,
        name: res.data.user.name,
        batch: res.data.user.batch || null, // Ensure batch is included
        branch: res.data.user.branch || null, // Add branch, fallback to null if not present
      });
      setRole(res.data.user.role);
      console.log('[AUTH] Login successful:', res.data.user.email, res.data.user.role, {
        batch: res.data.user.batch,
        branch: res.data.user.branch,
      });
      return { success: true, user: res.data.user, role: res.data.user.role };
    } catch (error) {
      console.error('[AUTH] Login error:', error.response?.data.message || error.message);
      return { success: false, message: error.response?.data.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/auth/logout`, { withCredentials: true });
      setUser(null);
      setRole(null);
      setNotifications([]);
      console.log('[AUTH] Logged out');
      return { success: true };
    } catch (error) {
      console.error('[AUTH] Logout error:', error.response?.data.message || error.message);
      return { success: false, message: error.response?.data.message || 'Logout failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/send-alumni-otp`,
        userData,
        { withCredentials: true }
      );
      console.log('[AUTH] Alumni registration initiated:', userData.email);
      return { success: true, otpToken: res.data.otpToken, message: res.data.message };
    } catch (error) {
      console.error('[AUTH] Registration error:', error.response?.data.message || error.message);
      return { success: false, message: error.response?.data.message || 'Registration failed' };
    }
  };

  const verifyOTP = async (otpToken, otp) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/verify-alumni-password`,
        { otpToken, otp },
        { withCredentials: true }
      );
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('[AUTH] OTP verification failed:', error.response?.data.message || error.message);
      return { success: false, message: error.response?.data.message || 'OTP verification failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      loading, 
      login, 
      logout, 
      register, 
      verifyOTP,
      notifications,
      setNotifications,
      fetchNotifications
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;