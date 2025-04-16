// frontend/src/components/ProtectedRouteWrapper.jsx
import React from 'react';
import ProtectedRoute from './ProtectedRoute';

const ProtectedRouteWrapper = ({ allowedRoles, element }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {element}
    </ProtectedRoute>
  );
};

export default ProtectedRouteWrapper;