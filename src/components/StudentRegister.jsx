import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const StudentRegister = () => {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (otpToken) {
      setTimer(600); // 10 minutes
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setError('OTP expired');
            setOtpToken('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate email domain
      if (!email.endsWith('@gcek.ac.in')) {
        setError('Email must end with @gcek.ac.in for students');
        return;
      }

      console.log('Checking if user exists:', email);
      const checkResponse = await axios.post(`${API_BASE_URL}/api/auth/check-user`, { email });
      if (checkResponse.data.exists) {
        setError('User already exists');
        return;
      }

      console.log('Sending OTP request:', { name, year, branch, email, password });
      const otpResponse = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        name,
        year,
        branch,
        email,
        password,
        role: 'Student',
      });
      console.log('OTP token received:', otpResponse.data.otpToken);
      setOtpToken(otpResponse.data.otpToken);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
    } catch (err) {
      setError('Failed to send OTP: ' + (err.response?.data.message || err.message));
      console.error('OTP send error:', err.response?.data || err);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      console.log('Verifying OTP:', { otpToken, otp });
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-and-register`, {
        name,
        year,
        branch,
        email,
        password,
        role: 'Student',
        otpToken,
        otp,
      });
      console.log('Verification response:', response.data);
      console.log('Student registration successful');
      navigate('/', { replace: true });
    } catch (err) {
      setError('Invalid OTP or registration failed: ' + (err.response?.data.message || err.message));
      console.error('Verification error:', err.response?.data || err);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Student Registration
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {!otpToken ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                placeholder="Enter Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                placeholder="Enter Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="email"
                placeholder="Enter Email (must be @gcek.ac.in)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <form onSubmit={handleVerifyOtp}>
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
            <p className="text-center">
              Time left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </p>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Verify OTP
            </button>
          </form>
        )}
        {showPopup && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-blue-600 shadow-lg rounded px-6 py-4">
            <p className="text-blue-800 font-medium">
              An OTP has been sent to <span className="font-bold">{email}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegister;