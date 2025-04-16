import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/check-email`, { email });
      if (res.data.exists && !res.data.registered) {
        const otpRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-registration-otp`, { email });
        setOtpToken(otpRes.data.otpToken);
        setOtpSent(true);
        console.log('[FRONTEND] OTP sent for:', email);
      } else {
        setError(res.data.message);
        console.log('[FRONTEND] Email check failed:', res.data.message);
      }
    } catch (err) {
      setError(err.response?.data.message || 'Error checking email');
      console.error('[FRONTEND] Email check error:', err.response?.data.message || err.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-and-set-password`, { email, otp, password, otpToken });
      console.log('[FRONTEND] Registration successful for:', email);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data.message || 'Registration failed');
      console.error('[FRONTEND] Registration error:', err.response?.data.message || err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Register</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {!otpSent ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="password"
                placeholder="Set Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Verify and Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;