// src/components/admin/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // 1. Wait for auth state re-hydration before evaluating protection
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // 2. Redirect to Login if unauthenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Role-Based Navigation Guard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'admin' ? '/admin/dashboard' : '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;