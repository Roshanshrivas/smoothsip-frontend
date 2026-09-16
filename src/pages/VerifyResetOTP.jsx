// src/pages/VerifyResetOTP.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const VerifyResetOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!emailFromState) {
      toast.error('Please start over');
      navigate('/forgot-password');
    }
  }, [emailFromState, navigate]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  useEffect(() => {
    const code = otp.join('');
    if (code.length === OTP_LENGTH && !loading) {
      handleVerify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleVerify = async (code) => {
    setLoading(true);
    try {
      const res = await authService.verifyResetOTP(emailFromState, code);
      toast.success(res.message || 'OTP verified!');
      navigate('/reset-password', {
        state: { email: emailFromState, resetToken: res.resetToken },
        replace: true,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await authService.forgotPassword(emailFromState);
      toast.success('New OTP sent');
      setOtp(Array(OTP_LENGTH).fill(''));
      setCooldown(RESEND_COOLDOWN);
      inputsRef.current[0]?.focus();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00A9C0] mb-5 transition"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="w-14 h-14 rounded-full bg-[#E6F9FA] flex items-center justify-center mb-5">
          <ShieldCheck className="w-6 h-6 text-[#00A9C0]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h1>
        <p className="text-sm text-gray-500 mb-6">
          We sent a 6-digit code to <strong className="text-gray-800">{emailFromState}</strong>
        </p>

        <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={loading}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#F4F5F7] border-2 border-transparent rounded-xl focus:border-[#00A9C0] focus:bg-white outline-none transition"
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center gap-2 mb-4 text-sm text-[#00A9C0]">
            <Loader className="w-4 h-4 animate-spin" /> Verifying...
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mb-6">
          Didn't receive the code?{' '}
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#00A9C0] font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          The code will expire in 10 minutes.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyResetOTP;