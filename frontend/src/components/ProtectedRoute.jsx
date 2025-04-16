// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth();
  console.log('ProtectedRoute check:', { 
    user: !!user, 
    role, 
    loading, 
    allowedRoles,
    isRoleAllowed: allowedRoles ? allowedRoles.includes(role) : false
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('No user authenticated, redirecting to /');
    return <Navigate to="/" />;
  }

  if (!allowedRoles || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    console.log(`Role ${role} not allowed for this route, redirecting to /`);
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;