import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  Package,
  Truck,
  CheckCircle,
  Tag,
  X,
  CheckCheck,
  Trash2,
  Loader2,
  Flame,
  Ticket,
  User,
  Star,
  Percent,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
} from '../../store/slices/notificationSlice';

const iconMap = {
  order: Package,
  shipping: Truck,
  promotion: Flame,
  coupon: Ticket,
  system: User,
  account: User,
};

const colorMap = {
  order: 'text-green-600 bg-green-50 dark:bg-green-900/30',
  shipping: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
  promotion: 'text-orange-500 bg-orange-50 dark:bg-orange-900/30',
  coupon: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30',
  system: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30',
  account: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
};

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isLoading = useSelector(selectNotificationLoading);

  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    dispatch(fetchNotifications({ page, filter }));
  }, [dispatch, page, filter]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
    toast.success('Notification deleted');
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filterOptions = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'order', label: 'Orders', icon: Package },
    { value: 'promotion', label: 'Offers', icon: Tag },
    { value: 'shipping', label: 'Shipping', icon: Truck },
    { value: 'coupon', label: 'Coupons', icon: Ticket },
    { value: 'system', label: 'Account', icon: User },
  ];

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 size={32} className="animate-spin text-[#14C6D8]" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EEF2] dark:border-[#18212A]/30 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#18212A] dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-1">
            Stay updated with your orders, offers and account activity.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs sm:text-sm font-bold text-[#14C6D8] hover:text-[#0FB2C3] transition flex items-center gap-1"
        >
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left – Notifications list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="bg-white dark:bg-[#18212A] border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {filterOptions.map((option) => {
              const isActive = filter === option.value;
              const TabIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 sm:gap-2 relative whitespace-nowrap outline-none ${
                    isActive
                      ? 'text-[#14C6D8] bg-[#E6F9FA] dark:bg-[#14C6D8]/20'
                      : 'text-[#5F6C7B] dark:text-[#5F6C7B] hover:bg-[#F8FBFC] dark:hover:bg-[#18212A]/50'
                  }`}
                >
                  <TabIcon size={14} className={isActive ? 'text-[#14C6D8]' : 'text-[#5F6C7B]/60'} />
                  <span className="hidden xs:inline">{option.label}</span>
                  {option.value === 'all' && notifications.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F8FBFC] dark:bg-[#18212A]/30 text-[#5F6C7B]">
                      {notifications.length}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="tabMarkerLine"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#14C6D8] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification list */}
          <div className="bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 divide-y divide-[#E8EEF2] dark:divide-[#18212A]/30 shadow-sm">
            {notifications.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <Bell size={40} className="mx-auto text-[#5F6C7B]/40 dark:text-[#5F6C7B]/30 mb-2" />
                <h3 className="text-sm font-bold text-[#18212A] dark:text-white">All caught up!</h3>
                <p className="text-xs text-[#5F6C7B] mt-1">No notifications found in this filter.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {notifications.map((notification) => {
                  const IconComponent = iconMap[notification.type] || Bell;
                  const colorClass = colorMap[notification.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-800/30';
                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 group hover:bg-[#F8FBFC] dark:hover:bg-[#18212A]/30 transition-colors"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className={`p-2.5 rounded-full flex-shrink-0 ${colorClass}`}>
                          <IconComponent size={18} strokeWidth={2} />
                        </div>
                        <div className="space-y-0.5 text-xs sm:text-sm">
                          <h4 className="font-bold text-[#18212A] dark:text-white flex items-center gap-2">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="inline-block w-2 h-2 bg-[#14C6D8] rounded-full" />
                            )}
                          </h4>
                          <p className="text-[#5F6C7B] dark:text-[#5F6C7B] leading-relaxed max-w-xl">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-start mt-1 flex-shrink-0">
                        <span className="text-[11px] text-[#5F6C7B]/60 font-medium whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                        <div className="w-5 flex justify-end">
                          {!notification.isRead ? (
                            <button
                              onClick={() => handleMarkRead(notification._id)}
                              className="w-2 h-2 bg-[#14C6D8] rounded-full group-hover:scale-125 transition-transform"
                              title="Mark as read"
                            />
                          ) : (
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="text-[#5F6C7B]/40 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Pagination – if needed */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    page === i + 1
                      ? 'bg-[#14C6D8] text-white'
                      : 'bg-white dark:bg-[#18212A] text-[#5F6C7B] hover:bg-[#F8FBFC]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-[#5F6C7B]/60 font-medium pl-1">
            Showing {notifications.length} of {notifications.length} notifications
          </p>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#18212A] dark:text-white uppercase tracking-wide">
              Notification Summary
            </h3>
            <div className="mt-4 space-y-3 text-xs font-semibold text-[#5F6C7B] dark:text-[#5F6C7B]">
              <div className="flex justify-between">
                <span>Unread</span>
                <span className="text-[#14C6D8] text-sm font-bold">{unreadCount}</span>
              </div>
              <div className="flex justify-between border-t border-[#E8EEF2] dark:border-[#18212A]/30 pt-2.5">
                <span>Total</span>
                <span className="text-[#18212A] dark:text-white">{notifications.length}</span>
              </div>
            </div>
            <button
              onClick={handleMarkAllRead}
              className="w-full mt-4 py-2 border border-[#14C6D8]/30 text-[#14C6D8] hover:bg-[#E6F9FA] dark:hover:bg-[#14C6D8]/20 rounded-xl text-xs font-bold transition"
            >
              Mark all as read
            </button>
          </div>

          {/* Preferences – placeholder (you can extend) */}
          <div className="bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 p-5 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-[#18212A] dark:text-white uppercase tracking-wide">
                Notification Preferences
              </h3>
              <p className="text-[11px] text-[#5F6C7B] mt-0.5">Choose what you want to be notified about.</p>
            </div>
            <div className="mt-4 space-y-3.5">
              {[
                { key: 'order', label: 'Order Updates' },
                { key: 'shipping', label: 'Shipping Updates' },
                { key: 'promotion', label: 'Offers & Deals' },
                { key: 'coupon', label: 'Coupons' },
                { key: 'account', label: 'Account Updates' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between gap-4">
                  <div className="text-xs font-bold text-[#18212A] dark:text-white">{pref.label}</div>
                  <button
                    className="w-9 h-5 rounded-full bg-[#14C6D8] p-0.5 transition-colors"
                    // Mock toggle – you can save user preferences later
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-sm transform translate-x-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast.success('Preferences updated (mock)')}
              className="w-full mt-4 py-2 border border-[#E8EEF2] dark:border-[#18212A]/30 text-[#5F6C7B] hover:bg-[#F8FBFC] dark:hover:bg-[#18212A]/30 rounded-xl text-xs font-bold transition"
            >
              Manage Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;