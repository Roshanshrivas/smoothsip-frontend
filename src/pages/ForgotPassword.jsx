// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(cleanEmail);
      toast.success(res.message || 'OTP sent to your email');
      setSent(true);
      setTimeout(() => {
        navigate('/verify-reset-otp', { state: { email: cleanEmail } });
      }, 1200);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00A9C0] mb-5 transition"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="w-14 h-14 rounded-full bg-[#E6F9FA] flex items-center justify-center mb-5">
          <Mail className="w-6 h-6 text-[#00A9C0]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we'll send you a 6-digit code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading || sent}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A9C0] focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || sent}
            className="w-full bg-[#00A9C0] hover:bg-[#0092a8] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : sent ? (
              'Redirecting...'
            ) : (
              'Send Reset Code'
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-[#00A9C0] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;