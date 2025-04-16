import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const AdvisorForm = ({ onGoogleLogin, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the hook instead of direct context
  const { login } = useAuth();
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      console.log('[FRONTEND] Login successful, role:', result.role);
      
      if (result.success) {
        navigate(`/${result.role.toLowerCase()}`, { replace: true });
      } else {
        setLocalError(result.message || 'Login failed');
        if (setError) setError(result.message || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setLocalError(errorMsg);
      if (setError) setError(errorMsg);
      console.error('[FRONTEND] Login error:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
      {localError && (
        <p
          className="text-blue-600 text-sm text-center bg-blue-200 p-2 rounded-lg animate-fade-in"
          role="alert"
        >
          {localError}
        </p>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-poppins text-gray-800 mb-1"
        >
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
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-poppins text-gray-800 mb-1"
        >
          Password <span className="text-blue-600">*</span>
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
      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-sm font-poppins text-blue-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
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
      <button
        type="button"
        onClick={onGoogleLogin}disabled={isLoading}
        className="w-full py-3 rounded-lg border border-gray-300 flex items-center justify-center gap-2 font-poppins text-gray-800 bg-white hover:bg-gray-50 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-500"
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
          <>
            <FcGoogle size={20} />
            Sign in with Google
          </>
        )}
      </button>
    </form>
  );
};

export { AdvisorForm };