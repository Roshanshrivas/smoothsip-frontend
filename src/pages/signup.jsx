// src/pages/SignupPage.jsx – Teal Theme, Responsive, Production-Ready
import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice';
import { Mail, Lock, Eye, EyeOff, Leaf, User, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import BrandPanel from "../components/BrandPanel";


const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);

// ─── Social Button ──────────────────────────────────
const SocialButton = ({ label, icon }) => (
  <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#14C6D8] hover:bg-[#E6F9FA] hover:text-[#14C6D8]">
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// ─── Social Icons (same as Login) ──────────────────
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.8 2.95c.9-2.7 3.4-4.41 6.7-4.41z"/>
    <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.5h6.48c-.28 1.48-1.11 2.73-2.37 3.58l3.67 2.84c2.15-1.98 3.72-4.9 3.72-8.54z"/>
    <path fill="#FBBC05" d="M5.3 14.45c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.5 6.9C.54 8.84 0 11.01 0 12.35s.54 3.51 1.5 5.45l3.8-2.95z"/>
    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.67-2.84c-1.02.68-2.33 1.09-4.29 1.09-3.3 0-5.8-1.71-6.7-4.41L1.5 16.88C3.4 20.73 7.35 23 12 23z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-4 w-4 fill-black" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.31.11.45.11.85 0 1.71-.41 2.37-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FEDA77" />
      <stop offset="50%" stopColor="#F58529" />
      <stop offset="100%" stopColor="#DD2A7B" />
    </linearGradient>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.8" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
  </svg>
);

// ─── MAIN COMPONENT ──────────────────────────────────
export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!validateMobile(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      toast.error("You must agree to the Terms & Conditions.");
      return;
    }
    try {
      const result = await dispatch(registerUser({ fullName, email, phone: mobile, password })).unwrap();
      toast.success(`Welcome to SmoothSip, ${result.user.name}!`);
      
      // Auto-navigate role-wise upon registration
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <BrandPanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-[#E6F9FA]/30 order-1 lg:order-2">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-[#E6F9FA] rounded-full flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-[#14C6D8]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Create <span className="text-[#14C6D8]">Account</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Join Tumblré and make every sip special.</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-px bg-gray-200" />
              <Leaf className="h-4 w-4 text-[#14C6D8]" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#14C6D8] focus:ring-1 focus:ring-[#14C6D8] outline-none text-sm transition"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    maxLength={10}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#14C6D8] focus:ring-1 focus:ring-[#14C6D8] outline-none text-sm transition"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#14C6D8] focus:ring-1 focus:ring-[#14C6D8] outline-none text-sm transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg focus:border-[#14C6D8] focus:ring-1 focus:ring-[#14C6D8] outline-none text-sm transition"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg focus:border-[#14C6D8] focus:ring-1 focus:ring-[#14C6D8] outline-none text-sm transition"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#14C6D8] focus:ring-[#14C6D8]"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I agree to the <a href="#" className="text-[#14C6D8] hover:text-[#0FB2C3] transition">Terms & Conditions</a> and <a href="#" className="text-[#14C6D8] hover:text-[#0FB2C3] transition">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#14C6D8] hover:bg-[#0FB2C3] text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg hover:shadow-[#14C6D8]/30"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4" />}
              <span>{isLoading ? "Creating..." : "Create Account"}</span>
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#14C6D8] hover:text-[#0FB2C3] transition">
                Login
              </Link>
            </p>
          </div>

          <div className="relative flex py-4 items-center mt-2">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-400">or continue with</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SocialButton label="Google" icon={<GoogleIcon />} />
            <SocialButton label="Apple" icon={<AppleIcon />} />
            <SocialButton label="Facebook" icon={<FacebookIcon />} />
            <SocialButton label="Instagram" icon={<InstagramIcon />} />
          </div>

          <div className="text-center text-[10px] text-gray-400 mt-6">
            © 2026 Tumbleré Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}