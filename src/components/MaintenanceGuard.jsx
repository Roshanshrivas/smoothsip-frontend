// src/components/MaintenanceGuard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export const MaintenanceGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowMaintenance, setShouldShowMaintenance] = useState(false);
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const hasChecked = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Prevent duplicate checks
    if (hasChecked.current) {
      setIsChecking(false);
      return;
    }

    // ─── Force exit after 5 seconds if auth is stuck ──
    const forceUnblock = () => {
      if (!hasChecked.current) {
        console.warn('MaintenanceGuard: Auth loading timeout – proceeding without admin bypass');
        hasChecked.current = true;
        setIsChecking(false);
      }
    };
    timeoutRef.current = setTimeout(forceUnblock, 5000);

    const checkMaintenance = async () => {
      try {
        const currentPath = window.location.pathname;

        // Always skip these paths
        if (
          currentPath === '/login' ||
          currentPath === '/signup' ||
          currentPath === '/maintenance' ||
          currentPath.startsWith('/admin')
        ) {
          hasChecked.current = true;
          setIsChecking(false);
          return;
        }

        // Admin users bypass – but only if we have the user object
        if (user && user.role === 'admin') {
          hasChecked.current = true;
          setIsChecking(false);
          return;
        }

        // If auth is still loading, don't block – we will check later.
        // But we don't want to wait; we'll just check maintenance anyway.
        // The only risk is if the user is admin but auth is still loading,
        // we might incorrectly redirect. That's why we have the timeout above.

        const response = await fetch(`${API_BASE}/health/maintenance-status`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const maintenance = data.maintenance === true;

        if (maintenance) {
          setShouldShowMaintenance(true);
          // Redirect to maintenance page
          if (!window.location.pathname.includes('/maintenance')) {
            window.location.href = '/maintenance';
          }
        } else {
          setShouldShowMaintenance(false);
        }
      } catch (error) {
        console.warn('Maintenance check failed:', error.message);
        // On error, assume no maintenance (fail open)
        setShouldShowMaintenance(false);
      } finally {
        hasChecked.current = true;
        setIsChecking(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    // If auth is still loading, we still check (but admin bypass won't work yet)
    // But we want to check immediately, so call it.
    checkMaintenance();

    // Re-check every 30 seconds
    const interval = setInterval(() => {
      // Only re-check if we haven't already redirected
      if (!window.location.pathname.includes('/maintenance')) {
        // Reset the flag so we can check again
        hasChecked.current = false;
        checkMaintenance();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]); // Re-run if user changes (e.g., after login)

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If maintenance is active and not already on maintenance page, render nothing
  if (shouldShowMaintenance && !window.location.pathname.includes('/maintenance')) {
    return null;
  }

  return children;
};