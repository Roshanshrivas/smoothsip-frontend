// src/components/admin/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;