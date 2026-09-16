// src/components/UserProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const UserProtectedRoute = () => {
  // 🔧 Development bypass – remove this in production!
  if (process.env.NODE_ENV === 'development') {
    // Set a dummy token if not present
    if (!localStorage.getItem('accessToken')) {
      localStorage.setItem('accessToken', 'dev-dummy-token');
    }
    return <Outlet />;
  }

  // Production check
  const token = localStorage.getItem('accessToken');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default UserProtectedRoute;