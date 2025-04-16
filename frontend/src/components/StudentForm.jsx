import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const StudentForm = ({ onGoogleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        console.log('[FRONTEND] Login successful, role:', result.role);
        navigate(`/${result.role.toLowerCase()}`, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      console.error('[FRONTEND] Login error:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
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
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-poppins text-gray-600"
          required
          
          aria-label="Password"
        />
      </div>
      
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
          Forgot password?
        </Link>
      </div>
      
      <div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-900 to-blue-400 text-white font-poppins font-medium text-base hover:from-blue-800 hover:to-blue-300 hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          'Sign In'
        )}
      </button>
      </div>
      
      {onGoogleLogin && (
        <div>
          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
          >
            <FcGoogle className="text-xl" />
            Login with Google
          </button>
        </div>
      )}
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800">
            Register Now
          </Link>
        </p>
      </div>
    </form>
  );
};

export { StudentForm };