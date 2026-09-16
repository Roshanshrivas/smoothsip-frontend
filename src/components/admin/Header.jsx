// src/components/admin/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  Settings,
  ChevronDown,
  Search,
  Moon,
  Sun,
  LogOut,
  Menu,
  Maximize2,
  Minimize2,
  Package,
  Heart,
  Clock,
  Calendar,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux"; 
import { logoutUser } from "../../store/slices/authSlice";
import { notificationService } from "../../services/notificationService";


const Header = ({ onMobileMenuClick, darkMode, setDarkMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user, isLoading: authLoading } = useSelector((state) => state.auth);

  const profileDropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // ─── Real-time clock (India time) ─────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Check fullscreen state ──────────────────────────
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    return () => document.removeEventListener("fullscreenchange", checkFullscreen);
  }, []);

  // ─── Close dropdowns on outside click ────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Fetch notifications ──────────────────────────────
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAdminNotifications();
      const formatted = (data.notifications || []).map(n => ({ ...n, id: n._id }));
      setNotifications(formatted);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Poll notifications every 30 seconds ──────────────
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Mark a notification as read ──────────────────────
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAdminAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  // ─── Mark all as read ──────────────────────────────────
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAdminAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  // ─── Delete a notification ────────────────────────────
  const handleDelete = async (id) => {
    try {
      await notificationService.deleteAdminNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // If it was unread, decrease count
      const wasUnread = notifications.find((n) => n.id === id && !n.read);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // ─── Notification click → mark as read + navigate ─────
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    // If notification has a link, navigate to it
    if (notification.link) {
      navigate(notification.link);
    }
    setIsNotificationsOpen(false);
  };

  // ─── Logout ─────────────────────────────────────────────
   const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      // Even if the API call fails, we clear the local state
      toast.error("Logout failed, but you have been signed out.");
      navigate("/login");
    }
  };

  // ─── Toggle fullscreen ─────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // ─── Page title helper ─────────────────────────────────
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) return "Dashboard";
    if (path.includes("/admin/products")) return "Products";
    if (path.includes("/admin/categories")) return "Categories";
    if (path.includes("/admin/orders")) return "Orders";
    if (path.includes("/admin/custom-designs")) return "Custom Designs";
    if (path.includes("/admin/users")) return "Users";
    if (path.includes("/admin/analytics")) return "Analytics";
    if (path.includes("/admin/coupons")) return "Coupons";
    if (path.includes("/admin/banners")) return "Banners";
    if (path.includes("/admin/reviews")) return "Reviews";
    if (path.includes("/admin/settings")) return "Settings";
    if (path.includes("/admin/broadcast")) return "Broadcast";
    if (path.includes("/admin/notifications")) return "Notifications";
    return "Dashboard";
  };

  const initials = user?.name?.charAt(0) || "A";
  const userName = user?.name || "Admin";
  const userRole = user?.role === "admin" ? "Administrator" : "Customer";
  const userEmail = user?.email || "admin@tumbler.com";

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1 } },
  };

  // ─── Format time & date ────────────────────────────────
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };
  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[100] shadow-sm">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left side: page title + mobile menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>{getGreeting()}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300">
                {userName}
              </span>
            </p>
          </div>
        </div>

        {/* Right side: date/time + actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date/Time (desktop) */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatTime(currentTime)}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(currentTime)}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              IST
            </span>
          </div>

          {/* Mobile date/time */}
          <div className="lg:hidden flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mr-1">
            <Clock size={12} className="text-gray-400" />
            <span>{formatTime(currentTime)}</span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:bg-white dark:focus-within:bg-gray-900">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 outline-none text-sm w-52 text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
            <span className="text-[10px] text-gray-400 ml-2 hidden xl:block">⌘K</span>
          </div>

          {/* Dark mode toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600" />}
          </motion.button>

          {/* Fullscreen toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} className="text-gray-600 dark:text-gray-400" /> : <Maximize2 size={18} className="text-gray-600 dark:text-gray-400" />}
          </motion.button>

          {/* ─── NOTIFICATIONS BELL ────────────────────────── */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse shadow-md">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-[9999]"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="text-xs text-gray-500">{unreadCount} unread</span>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" />
                        <p className="text-xs mt-2">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <Bell size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group ${
                            !notif.read ? 'bg-orange-50/50 dark:bg-orange-900/10 border-l-2 border-l-orange-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 dark:text-white truncate">
                                {notif.message || notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notif.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.id);
                                  }}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notif.id);
                                }}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500"
                                title="Delete"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2 text-center border-t border-gray-200 dark:border-gray-800">
                    <Link
                      to="/admin/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs text-orange-600 hover:underline font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            {/* ... (unchanged) ... */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-orange-200/50 flex-shrink-0 group-hover:ring-orange-300 transition-all">
                  {initials}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                    {userRole}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
                >
                  {/* ... (profile dropdown content remains unchanged) ... */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || "admin@tumbler.com"}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                        {userRole}
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link to="/admin/profile" onClick={() => setIsProfileOpen(false)}>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                        <User size={16} /> Profile
                      </button>
                    </Link>
                    <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)}>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                        <Settings size={16} /> Settings
                      </button>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;