import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMessage(response.data.message);
      // Navigate to reset password page with token
      setTimeout(() => {
        navigate(`/reset-password?token=${response.data.otpToken}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-poppins font-semibold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>
        <form className="space-y-4" onSubmit={handleSendOTP}>
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-poppins text-gray-800 mb-1">
              Email <span className="text-blue-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-poppins text-gray-600"
              required
              aria-label="Email"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-900 to-blue-400 text-white font-poppins font-medium text-base hover:from-blue-800 hover:to-blue-300 hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Send OTP'
            )}
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;