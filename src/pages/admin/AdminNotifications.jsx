// src/pages/admin/AdminNotifications.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  Search,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { notificationService } from "../../services/notificationService";
import Pagination from "../../components/admin/Pagination";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterRead, setFilterRead] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const itemsPerPage = 20;
  const debounceTimer = useRef(null);

  // ─── Debounce search ─────────────────────────────────
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  // ─── Fetch notifications (with loading states) ──────
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) setIsFetching(true);
    try {
      const data = await notificationService.getAdminNotifications({
        page: currentPage,
        limit: itemsPerPage,
        read: filterRead === "all" ? undefined : filterRead === "read",
        search: debouncedSearch || undefined,
      });
      const formatted = (data.notifications || []).map((n) => ({
        ...n,
        id: n._id,
      }));
      setNotifications(formatted);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [currentPage, filterRead, debouncedSearch]);

  // ─── Initial load ────────────────────────────────────
  useEffect(() => {
    fetchNotifications(true);
  }, []); // only once

  // ─── Refetch when dependencies change ───────────────
  useEffect(() => {
    if (!initialLoading) {
      fetchNotifications(true);
    }
  }, [currentPage, filterRead, debouncedSearch]);

  // ─── Mark as read ──────────────────────────────────
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

  // ─── Mark all as read ─────────────────────────────
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast("No unread notifications");
      return;
    }
    try {
      await notificationService.markAllAdminAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  // ─── Delete single ────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await notificationService.deleteAdminNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const wasUnread = notifications.find((n) => n.id === id && !n.read);
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // ─── Delete all read ──────────────────────────────
  const handleDeleteAllRead = async () => {
    const readIds = notifications.filter((n) => n.read).map((n) => n.id);
    if (readIds.length === 0) {
      toast("No read notifications to delete");
      return;
    }
    if (!window.confirm(`Delete ${readIds.length} read notifications?`)) return;
    try {
      await Promise.all(readIds.map((id) => notificationService.deleteAdminNotification(id)));
      setNotifications((prev) => prev.filter((n) => !n.read));
      toast.success("Deleted all read notifications");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Loading spinner for initial load ──────────────
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="text-orange-500" size={24} />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount} unread · {totalItems} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Check size={16} /> Mark All Read
          </button>
          <button
            onClick={handleDeleteAllRead}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        >
          <option value="all">All</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm("");
            setFilterRead("all");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
        >
          Clear Filters
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {isFetching && notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto h-8 w-8 text-orange-500" />
              <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex items-start justify-between gap-4 ${
                  !notif.read ? "bg-orange-50/40 dark:bg-orange-900/5 border-l-4 border-l-orange-500" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(notif.createdAt)}
                    </span>
                    <span className="capitalize">• {notif.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500 transition"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  {notif.link && (
                    <a
                      href={notif.link}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition"
                      title="View"
                    >
                      <Eye size={18} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
          {isFetching && notifications.length > 0 && (
            <div className="p-2 text-center">
              <Loader2 className="animate-spin mx-auto h-5 w-5 text-orange-500" />
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminNotifications;