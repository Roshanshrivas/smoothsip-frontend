// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { motion, AnimatePresence } from "framer-motion";
import { IoSearchSharp } from "react-icons/io5";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiOutlineShoppingBag, HiMenu, HiX } from "react-icons/hi";
import {
  FiLogOut,
  FiUser,
  FiPackage,
  FiHeart as FiHeartOutline,
} from "react-icons/fi";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";
import SearchModal from "./SearchModal";
import toast from "react-hot-toast";
import logo from "../assets/sslogo.png";
import { Bell, LayoutDashboard, LifeBuoy, MapPin, Ticket, Shield } from "lucide-react";
import { selectCartTotalItems } from '../store/slices/cartSlice';
import { selectWishlistTotal } from '../store/slices/wishlistSlice';


// ─── Helper ──────────────────────────────────────────
// const getDashboardPath = (role) => {
//   return role === "admin" ? "/admin/dashboard" : "/dashboard/overview";
// };

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

  // ─── Safely Normalize Role Evaluation ─────────────────────────
  // Handles cases where payload is user or nested user object (e.g. user.user)
  const activeUser = user?.user || user;
  const userRole = (activeUser?.role || "").toLowerCase().trim();
  const isAdmin = userRole === "admin";

  const getUserInitials = () => (activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : "U");


  // ─── Handlers ──────────────────────────────────
  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
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


  // const loadUser = () => {
  //   const userData = localStorage.getItem("user");
  //   setUser(userData ? JSON.parse(userData) : null);
  // };

  // useEffect(() => {
  //   loadUser();
  //   window.addEventListener("userUpdated", loadUser);
  //   return () => window.removeEventListener("userUpdated", loadUser);
  // }, []);

  // const updateCartCount = () => {
  //   const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  //   setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  // };
  // const updateWishlistCount = () => {
  //   const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
  //   setWishlistCount(wishlist.length);
  // };

  // useEffect(() => {
  //   updateCartCount();
  //   updateWishlistCount();
  //   window.addEventListener("cartUpdated", updateCartCount);
  //   window.addEventListener("wishlistUpdated", updateWishlistCount);
  //   return () => {
  //     window.removeEventListener("cartUpdated", updateCartCount);
  //     window.removeEventListener("wishlistUpdated", updateWishlistCount);
  //   };
  // }, []);

  // useEffect(() => {
  //   document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  // }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target))
        setIsUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const closeMenu = () => setIsMenuOpen(false);
  // const closeUserDropdown = () => setIsUserDropdownOpen(false);

  // const handleLogout = () => {
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("token");
  //   setUser(null);
  //   window.dispatchEvent(new Event("userUpdated"));
  //   toast.success("Logged out successfully");
  //   navigate("/");
  //   closeUserDropdown();
  //   closeMenu();
  // };

  // const handleOpenCart = () => {
  //   if (isMenuOpen) closeMenu();
  //   setIsCartOpen(true);
  // };
  // const handleOpenWishlist = () => {
  //   if (isMenuOpen) closeMenu();
  //   setIsWishlistOpen(true);
  // };
  // const handleOpenSearch = () => {
  //   if (isMenuOpen) closeMenu();
  //   setIsSearchOpen(true);
  // };

  // const getUserInitials = () => (user?.name ? user.name.charAt(0).toUpperCase() : "U");
  
  // const isAdmin = user?.role === "admin";

  // const dashboardPath = getDashboardPath(user?.role);


  // ─── Desktop User Dropdown Items ─────────────────────
  const desktopDropdownItems = isAdmin
    ? [
        { icon: Shield, label: "Admin Dashboard", path: "/admin/dashboard", divider: false },
        { icon: FiUser, label: "Profile", path: "/admin/profile", divider: false },
        { icon: FiPackage, label: "Orders", path: "/admin/orders", divider: false },
        { icon: FiLogOut, label: "Logout", path: "#", divider: false, isLogout: true },
      ]
    : [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/overview", divider: false },
        { icon: FiUser, label: "Profile", path: "/dashboard/profile", divider: false },
        { icon: FiPackage, label: "My Orders", path: "/dashboard/orders", divider: false },
        { icon: FiHeartOutline, label: "Wishlist", path: "/dashboard/wishlist", divider: false },
        { icon: MapPin, label: "Addresses", path: "/dashboard/addresses", divider: false },
        { icon: Ticket, label: "Coupons", path: "/dashboard/coupons", divider: false },
        { icon: Bell, label: "Notifications", path: "/dashboard/notifications", divider: false },
        { icon: LifeBuoy, label: "Support", path: "/dashboard/support", divider: true },
        { icon: FiLogOut, label: "Logout", path: "#", divider: false, isLogout: true },
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
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/overview" },
        { icon: FiUser, label: "Profile", path: "/dashboard/profile" },
        { icon: FiPackage, label: "My Orders", path: "/dashboard/orders" },
        { icon: FiHeartOutline, label: "Wishlist", path: "/dashboard/wishlist" },
        { icon: FiLogOut, label: "Logout", path: "#", isLogout: true },
      ];


      const navLinkClass = ({ isActive }) => `
       relative hover:text-[#00A0B0] transition duration-300
       ${isActive ? "text-[#18C6D9] font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#18C6D9] after:rounded-full" : "text-gray-700"}
      `;

  // ─── Animation variants ──────────────────────────────
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 100 } },
  };
  const dropdownVariants = {
    hidden: { opacity: 0, y: -15, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15 } },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };
  const mobileMenuVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", damping: 20 } },
    exit: { x: "100%", transition: { duration: 0.2 } },
  };
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };


  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-white shadow-lg sticky top-0 z-50"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-12">
          <div className="relative flex items-center h-16 md:h-20">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
                <img src={logo} alt="logo" className="h-7 xs:h-9 w-[180px] xs:w-[170px]" />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
              <ul className="flex space-x-7 font-medium">
                <li><NavLink to="/" className={navLinkClass} end>Home</NavLink></li>
                <li><NavLink to="/allproducts" className={navLinkClass}>Shop</NavLink></li>
                <li><NavLink to="/customize" className={navLinkClass}>Customize</NavLink></li>
                <li><NavLink to="/about" className={navLinkClass}>About us</NavLink></li>
                <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
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
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                        {desktopDropdownItems.map((item, idx) => {
                          if (item.divider) return <div key={idx} className="border-t border-gray-100 my-1" />;
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
                  <HiOutlineShoppingBag className="text-2xl text-gray-700" />
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
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
                  <Link to="/login">
                    <button className="px-4 py-1.5 bg-gradient-to-r from-[#14C6D8] to-[#0FB2C3] text-white text-sm rounded-lg font-semibold shadow-md">
                      Sign In
                    </button>
                  </Link>
                )}

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 focus:outline-none"
                >
                  {isMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Drawers & Modal */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMenu}
            />
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
                    Menu
                  </span>
                  <button onClick={closeMenu} className="text-gray-400 hover:text-gray-600">
                    <HiX className="text-2xl" />
                  </button>
                </div>
                <ul className="flex-1 overflow-y-auto py-6 px-5 space-y-5">
                  <li>
                    <Link to="/" onClick={closeMenu} className="block text-lg font-semibold text-gray-800 hover:text-[#14C6D8] transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/allproducts" onClick={closeMenu} className="block text-lg font-semibold text-gray-800 hover:text-[#14C6D8] transition">
                      Shop
                    </Link>
                  </li>
                  <li>
                    <Link to="/customize" onClick={closeMenu} className="block text-lg font-semibold text-gray-800 hover:text-[#14C6D8] transition">
                      Customize
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={closeMenu} className="block text-lg font-semibold text-gray-800 hover:text-[#14C6D8] transition">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={closeMenu} className="block text-lg font-semibold text-gray-800 hover:text-[#14C6D8] transition">
                      Contact
                    </Link>
                  </li>
                </ul>
                <div className="border-t border-gray-100 p-5">
                  <div className="flex justify-around">
                    <button onClick={handleOpenSearch} className="flex flex-col items-center gap-1">
                      <IoSearchSharp className="text-2xl text-gray-600 hover:text-[#14C6D8]" />
                      <span className="text-xs text-gray-500">Search</span>
                    </button>
                    <button onClick={handleOpenWishlist} className="relative flex flex-col items-center gap-1">
                      <FaHeart className="text-2xl text-gray-600 hover:text-[#14C6D8]" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">Wishlist</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;