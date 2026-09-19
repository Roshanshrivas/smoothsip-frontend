// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { motion, AnimatePresence } from "framer-motion";
import { IoSearchSharp } from "react-icons/io5";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiOutlineShoppingBag, HiMenu, HiX } from "react-icons/hi";
import { FiLogOut, FiUser, FiPackage, FiHeart as FiHeartOutline } from "react-icons/fi";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";
import SearchModal from "./SearchModal";
import toast from "react-hot-toast";
import logo from "../assets/sslogo.png";
import { Bell, LayoutDashboard, LifeBuoy, MapPin, Ticket, Shield, User } from "lucide-react";
import { selectCartTotalItems } from '../store/slices/cartSlice';
import { selectWishlistTotal } from '../store/slices/wishlistSlice';
import { FiHome, FiShoppingBag, FiEdit3, FiInfo, FiPhone, FiChevronRight, FiX, FiSearch, FiHeart } from "react-icons/fi";
import { IoWaterOutline } from "react-icons/io5";
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';


// ─── Static animation variants (defined once, outside component) ───
const SNAPPY_EASE = [0.32, 0.72, 0, 1];   // expo-out feel

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

const mobileMenuVariants = {
  hidden:  { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: SNAPPY_EASE },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};


const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartTotalItems);
  const wishlistCount = useSelector(selectWishlistTotal);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef(null);
  useBodyScrollLock(isMenuOpen);

  // ─── Safely Normalize Role Evaluation ─────────────────────────
  // Handles cases where payload is user or nested user object (e.g. user.user)
  const activeUser = user?.user || user;
  const userRole = (activeUser?.role || "").toLowerCase().trim();
  const isAdmin = userRole === "admin";

  const getUserInitials = () =>
    activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : "U";

  // ─── Handlers ──────────────────────────────────
  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleOpenCart = () => {
    if (isMenuOpen) closeMenu();
    setIsCartOpen(true);
  };
  const handleOpenWishlist = () => {
    if (isMenuOpen) closeMenu();
    setIsWishlistOpen(true);
  };
  const handleOpenSearch = () => {
    if (isMenuOpen) closeMenu();
    setIsSearchOpen(true);
  };
  const closeMenu = () => setIsMenuOpen(false);
  const closeUserDropdown = () => setIsUserDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      )
        setIsUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Desktop User Dropdown Items ─────────────────────
  const desktopDropdownItems = isAdmin
    ? [
        {
          icon: Shield,
          label: "Admin Dashboard",
          path: "/admin/dashboard",
          divider: false,
        },
        {
          icon: FiUser,
          label: "Profile",
          path: "/admin/profile",
          divider: false,
        },
        {
          icon: FiPackage,
          label: "Orders",
          path: "/admin/orders",
          divider: false,
        },
        {
          icon: FiLogOut,
          label: "Logout",
          path: "#",
          divider: false,
          isLogout: true,
        },
      ]
    : [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard/overview",
          divider: false,
        },
        {
          icon: FiUser,
          label: "Profile",
          path: "/dashboard/profile",
          divider: false,
        },
        {
          icon: FiPackage,
          label: "My Orders",
          path: "/dashboard/orders",
          divider: false,
        },
        {
          icon: FiHeartOutline,
          label: "Wishlist",
          path: "/dashboard/wishlist",
          divider: false,
        },
        {
          icon: MapPin,
          label: "Addresses",
          path: "/dashboard/addresses",
          divider: false,
        },
        {
          icon: Ticket,
          label: "Coupons",
          path: "/dashboard/coupons",
          divider: false,
        },
        {
          icon: Bell,
          label: "Notifications",
          path: "/dashboard/notifications",
          divider: false,
        },
        {
          icon: LifeBuoy,
          label: "Support",
          path: "/dashboard/support",
          divider: true,
        },
        {
          icon: FiLogOut,
          label: "Logout",
          path: "#",
          divider: false,
          isLogout: true,
        },
      ];

  // ─── Mobile User Dropdown Items ─────────────────────
  const mobileDropdownItems = isAdmin
    ? [
        { icon: Shield, label: "Admin Dashboard", path: "/admin/dashboard" },
        { icon: FiUser, label: "Profile", path: "/admin/profile" },
        { icon: FiPackage, label: "Orders", path: "/admin/orders" },
        { icon: FiLogOut, label: "Logout", path: "#", isLogout: true },
      ]
    : [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard/overview",
        },
        { icon: FiUser, label: "Profile", path: "/dashboard/profile" },
        { icon: FiPackage, label: "My Orders", path: "/dashboard/orders" },
        {
          icon: FiHeartOutline,
          label: "Wishlist",
          path: "/dashboard/wishlist",
        },
        { icon: FiLogOut, label: "Logout", path: "#", isLogout: true },
      ];

  const navLinkClass = ({ isActive }) => `
       relative hover:text-[#00A0B0] transition duration-300
       ${isActive ? "text-[#18C6D9] font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#18C6D9] after:rounded-full" : "text-gray-700"}
      `;

  // ─── Animation variants ──────────────────────────────
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
  };
  const dropdownVariants = {
    hidden: { opacity: 0, y: -15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 15 },
    },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-white md:shadow-lg sticky top-0 z-50"
      >
        <div className="mx-auto px-1 sm:px-6 lg:px-12">
          <div className="relative flex items-center h-16 md:h-20">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent"
              >
                <img
                  src={logo}
                  alt="logo"
                  className="h-7 xs:h-9 w-[190px] xs:w-[170px]"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
              <ul className="flex space-x-7 font-medium">
                <li>
                  <NavLink to="/" className={navLinkClass} end>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/allproducts" className={navLinkClass}>
                    Shop
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/customize" className={navLinkClass}>
                    Customize
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className={navLinkClass}>
                    About us
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className={navLinkClass}>
                    Contact
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Desktop Right Icons + User */}
            <div className="hidden md:flex items-center gap-6 ml-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenSearch}
                className="cursor-pointer text-xl text-gray-700 hover:text-[#00C2D6] transition"
              >
                <IoSearchSharp />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenWishlist}
                className="relative"
              >
                <FaRegHeart className="cursor-pointer text-xl text-gray-700 hover:text-[#00C2D6] transition" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenCart}
                className="relative"
              >
                <HiOutlineShoppingBag className="cursor-pointer text-xl text-gray-700 hover:text-[#00C2D6] transition" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {isAuthenticated && activeUser ? (
                <div className="relative" ref={mobileDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00A0B0] to-[#09B0BE] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-[#14C6D8]">
                      {getUserInitials()}
                    </div>
                  </motion.button>
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#00A0B0]/20 to-white">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00A0B0] to-[#09B0BE] text-white flex items-center justify-center font-bold">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {desktopDropdownItems.map((item, idx) => {
                          if (item.divider)
                            return (
                              <div
                                key={idx}
                                className="border-t border-gray-100 my-1"
                              />
                            );
                          if (item.isLogout) {
                            return (
                              <button
                                key={idx}
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
                              >
                                <item.icon size={16} /> {item.label}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={idx}
                              to={item.path}
                              onClick={closeUserDropdown}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#00A0B0]/10 transition"
                            >
                              <item.icon size={16} /> {item.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#14C6D8] to-[#0FB2C3] hover:from-[#0FB2C3] hover:to-[#0098A8] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-[#14C6D8]/40 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile Icons + Menu */}
            <div className="flex md:hidden items-center justify-end w-full">
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOpenCart}
                  className="relative"
                >
                  <HiOutlineShoppingBag
                    strokeWidth={1.5}
                    className="text-gray-700 text-xl sm:text-2xl md:text-3xl"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </motion.button>

                {isAuthenticated ? (
                  <div className="relative">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00A0B0] to-[#09B0BE] text-white flex items-center justify-center font-bold text-sm shadow-md"
                    >
                      {getUserInitials()}
                    </motion.button>
                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#00A0B0]/20 to-white">
                            <p className="font-semibold text-gray-800">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          {mobileDropdownItems.map((item, idx) => {
                            if (item.isLogout) {
                              return (
                                <button
                                  key={idx}
                                  onClick={handleLogout}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <item.icon size={16} /> {item.label}
                                </button>
                              );
                            }
                            return (
                              <Link
                                key={idx}
                                to={item.path}
                                onClick={() => setIsUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#00A0B0]/10"
                              >
                                <item.icon size={16} /> {item.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="
                    inline-flex items-center justify-center gap-1.5 sm:gap-2
                    px-3 py-2 sm:px-4 sm:py-1.5
                    min-h-[25px] sm:min-h-0
                    text-xs sm:text-sm font-semibold text-white
                    rounded-lg
                    bg-gradient-to-r from-[#14C6D8] to-[#0FB2C3]
                    shadow-md
                    transition-all duration-200
                    hover:shadow-lg hover:scale-[1.02] hover:brightness-105
                    active:scale-[0.98]
                    focus:outline-none focus:ring-2 focus:ring-[#14C6D8]/50 focus:ring-offset-1
                    whitespace-nowrap
                  "
                  >
                    <User
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      strokeWidth={2.5}
                    />
                    <span>Sign In</span>
                  </Link>
                )}

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 focus:outline-none"
                >
                  {isMenuOpen ? (
                    <HiX className="text-2xl" />
                  ) : (
                    <HiMenu className="text-2xl" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Drawers & Modal */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Side Drawer — Optimized */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop — no blur, no heavy shadow */}
            <motion.div
              initial={false}
              animate={
                isMenuOpen
                  ? { opacity: 1, pointerEvents: "auto" }
                  : { opacity: 0, pointerEvents: "none" }
              }
              transition={{
                duration: isMenuOpen ? 0.2 : 0.15,
                ease: "easeOut",
              }}
              className="fixed inset-0 bg-black/45 z-40 md:hidden"
              onClick={closeMenu}
              style={{ willChange: "opacity" }}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={false}
              animate={isMenuOpen ? { x: 0 } : { x: "100%" }}
              transition={{
                duration: isMenuOpen ? 0.3 : 0.22,
                ease: isMenuOpen ? [0.32, 0.72, 0, 1] : [0.4, 0, 1, 1],
              }}
              className="fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-white z-50 md:hidden flex flex-col justify-between isolate"
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
                contain: "layout style paint",
              }}
            >
              {/* ─── Scrollable Body ─── */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="p-5">
                  {/* ─── Header ─── */}
                  <div className="flex justify-between items-start pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#E0F7FA] flex items-center justify-center text-[#00A9C0]">
                        <IoWaterOutline className="text-2xl fill-[#00A9C0]" />
                      </div>
                      <div>
                        <h3 className="text-[19px] font-extrabold text-[#1E293B] leading-tight">
                          Smooth<span className="text-[#00A9C0]">Sip</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                          Stay Hydrated • Stay Healthy
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeMenu}
                      aria-label="Close menu"
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition active:scale-90"
                    >
                      <FiX className="text-2xl" />
                    </button>
                  </div>

                  {/* ─── Navigation Links ─── */}
                  <div className="py-4 space-y-2.5">
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#EAF8FA] text-[#00A9C0] transition font-semibold active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#00A9C0] flex items-center justify-center text-white">
                          <FiHome className="text-lg" />
                        </div>
                        <span className="text-[14px]">Home</span>
                      </div>
                      <FiChevronRight className="text-lg text-[#00A9C0]" />
                    </Link>

                    <Link
                      to="/allproducts"
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-[#1E293B] transition font-semibold active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E8EDFB] flex items-center justify-center text-[#5A7CE2]">
                          <FiShoppingBag className="text-lg" />
                        </div>
                        <span className="text-[14px]">Shop</span>
                      </div>
                      <FiChevronRight className="text-lg text-gray-400" />
                    </Link>

                    <Link
                      to="/customize"
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-[#1E293B] transition font-semibold active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F4EBFB] flex items-center justify-center text-[#A663EC]">
                          <FiEdit3 className="text-lg" />
                        </div>
                        <span className="text-[14px]">Customize</span>
                      </div>
                      <FiChevronRight className="text-lg text-gray-400" />
                    </Link>

                    <Link
                      to="/about"
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-[#1E293B] transition font-semibold active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E7F8EE] flex items-center justify-center text-[#2ECC71]">
                          <FiInfo className="text-lg" />
                        </div>
                        <span className="text-[14px]">About Us</span>
                      </div>
                      <FiChevronRight className="text-lg text-gray-400" />
                    </Link>

                    <Link
                      to="/contact"
                      onClick={closeMenu}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-[#1E293B] transition font-semibold active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FDEEEE] flex items-center justify-center text-[#E74C3C]">
                          <FiPhone className="text-lg" />
                        </div>
                        <span className="text-[14px]">Contact</span>
                      </div>
                      <FiChevronRight className="text-lg text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* ─── Fixed Footer ─── */}
              <div className="p-5 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex justify-around items-center pb-4">
                  <button
                    onClick={handleOpenSearch}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#EBF7F9] flex items-center justify-center text-[#00A9C0] group-hover:scale-105 transition">
                      <FiSearch className="text-xl" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700">
                      Search
                    </span>
                  </button>

                  <button
                    onClick={handleOpenWishlist}
                    className="relative flex flex-col items-center gap-1 group active:scale-95 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FCEBEB] flex items-center justify-center text-[#E74C3C] group-hover:scale-105 transition">
                      <FiHeart className="text-xl" />
                    </div>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 right-2 bg-[#E74C3C] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                        {wishlistCount}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-gray-700">
                      Wishlist
                    </span>
                  </button>
                </div>

                <div className="text-center pt-2 pb-1 border-t border-gray-50">
                  <p className="text-[12px] font-serif italic text-[#00A9C0] select-none">
                    Good Hydration Brings Better Days
                  </p>
                  <div className="w-8 h-0.5 bg-[#00A9C0]/30 mx-auto mt-1 rounded-full" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};;

export default Navbar;