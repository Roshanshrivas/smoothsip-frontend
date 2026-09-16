// src/pages/dashboard/Overview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowRight,
  MapPin,
  User,
  Truck,
  CheckCircle,
  Ban,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { userOrderService } from '../../services/userOrderService';

// ─── Status Configuration ───────────────────────────
const statusConfig = {
  Pending: {
    label: 'Pending',
    color: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    icon: Clock,
  },
  Processing: {
    label: 'Processing',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    icon: RefreshCw,
  },
  Shipped: {
    label: 'Shipped',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    icon: Truck,
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-700',
    icon: Truck,
  },
  Delivered: {
    label: 'Delivered',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    icon: CheckCircle,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    icon: Ban,
  },
  Returned: {
    label: 'Returned',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/30',
    border: 'border-gray-200 dark:border-gray-700',
    icon: AlertCircle,
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Main Component ──────────────────────────────────
const Overview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Get user name from localStorage if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) setUserName(user.name);
      } catch (e) {}
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await userOrderService.fetchMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Stats ──────────────────────────────────────────
  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const processing = orders.filter((o) => o.status === 'Processing').length;
  const shipped = orders.filter((o) => o.status === 'Shipped' || o.status === 'Out for Delivery').length;
  const delivered = orders.filter((o) => o.status === 'Delivered').length;
  const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = orders.slice(0, 3);

  // ─── Loading State ──────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            👋 Welcome back, {userName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here's what's happening with your orders today.
          </p>
        </div>
        <Link
          to="/dashboard/orders"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
        >
          View All Orders <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          label="Delivered"
          value={delivered}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Order Status Summary – Mini Progress */}
      {totalOrders > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Order Status:</span>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill label="Pending" count={pending} total={totalOrders} color="bg-yellow-500" />
              <StatusPill label="Processing" count={processing} total={totalOrders} color="bg-blue-500" />
              <StatusPill label="Shipped" count={shipped} total={totalOrders} color="bg-purple-500" />
              <StatusPill label="Delivered" count={delivered} total={totalOrders} color="bg-green-500" />
              <StatusPill label="Cancelled" count={cancelled} total={totalOrders} color="bg-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
          <Link
            to="/dashboard/orders"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No orders yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Looks like you haven't placed any orders. Start shopping!
            </p>
            <Link
              to="/allproducts"
              className="mt-4 inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.Pending;
              const StatusIcon = status.icon;
              const firstItem = order.items?.[0] || {};
              const totalItems = order.items?.length || 0;

              return (
                <Link
                  key={order._id}
                  to={`/dashboard/orders/${order._id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-[#00C2D6]/40 transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={firstItem.image || 'https://placehold.co/56x56/f3f4f6/9ca3af?text=No'}
                        alt={firstItem.name || 'Product'}
                        className="w-14 h-14 rounded-lg object-cover bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {firstItem.name || 'Order #' + order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{order.total?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(order.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                      {(order.status === 'Shipped' || order.status === 'Out for Delivery') && (
                        <Link
                          to={`/dashboard/track/${order.orderNumber}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Truck size={14} /> Track
                        </Link>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction
            to="/dashboard/addresses"
            icon={MapPin}
            label="Manage Addresses"
          />
          <QuickAction
            to="/dashboard/wishlist"
            icon={Heart}
            label="View Wishlist"
          />
          <QuickAction
            to="/dashboard/profile"
            icon={User}
            label="Edit Profile"
          />
          <QuickAction
            to="/dashboard/orders"
            icon={Truck}
            label="Track Orders"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ──────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Status Pill ────────────────────────────────────
const StatusPill = ({ label, count, total, color }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {label} ({count})
      </span>
      <span className="text-xs text-gray-400">• {percentage}%</span>
    </div>
  );
};

// ─── Quick Action ──────────────────────────────────
const QuickAction = ({ to, icon: Icon, label }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-[#00C2D6] hover:border-[#00C2D6] dark:hover:border-[#00C2D6] hover:shadow-md transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#00C2D6]/10 dark:group-hover:bg-[#00C2D6]/20 transition-colors">
        <Icon size={18} className="text-gray-400 group-hover:text-[#00C2D6] transition-colors" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#00C2D6] transition-colors">
        {label}
      </span>
      <ArrowRight size={14} className="ml-auto text-gray-400 group-hover:text-[#00C2D6] transition-colors" />
    </Link>
  );
};

export default Overview;