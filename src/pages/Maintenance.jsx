// src/pages/Maintenance.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const Maintenance = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      const response = await fetch(`${API_BASE}/health/maintenance-status`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (!data.maintenance) {
        window.location.href = '/';
      }
    } catch (error) {
      console.warn('Status check failed');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
      >
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench size={48} className="text-orange-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          We'll Be Back Soon!
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          We're currently performing scheduled maintenance to improve your experience.
          Please check back in a few minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} className="text-orange-400" />
            <span>Estimated time: 5-10 minutes</span>
          </div>
          <button
            onClick={checkStatus}
            disabled={isChecking}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-xl transition shadow-sm"
          >
            <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Checking...' : 'Check Again'}
          </button>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400 space-y-2">
          <p>If you're an admin, you can still access the admin panel.</p>
          <Link to="/admin" className="inline-flex items-center gap-2 text-orange-500 hover:underline font-medium">
            <Home size={16} /> Go to Admin Panel
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;