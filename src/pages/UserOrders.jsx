// src/pages/UserOrders.jsx – Teal Theme, Production-Ready, Responsive
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Eye,
  X,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Calendar,
  Ban,
  RefreshCw,
  ShoppingBag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userOrderService } from '../services/userOrderService';

// ─── Status Configuration ───────────────────────────
const statusConfig = {
  Pending: {
    label: 'Pending',
    color: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-100 dark:border-yellow-800',
    icon: Clock,
  },
  Processing: {
    label: 'Processing',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    icon: RefreshCw,
  },
  Shipped: {
    label: 'Shipped',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    icon: Truck,
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800',
    icon: Truck,
  },
  Delivered: {
    label: 'Delivered',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
    icon: CheckCircle,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    icon: Ban,
  },
  Returned: {
    label: 'Returned',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800/50',
    border: 'border-gray-200 dark:border-gray-700',
    icon: AlertCircle,
  },
};

// ─── Order Row Card Component ───────────────────────────
const OrderCard = ({ order, onCancel, onView, index }) => {
  const status = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = status.icon;
  const firstItem = order.items?.[0] || {};
  const totalItems = order.items?.length || 0;

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const isShipped = order.status === 'Shipped';
  const isOutForDelivery = order.status === 'Out for Delivery';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-sm transition-shadow"
    >
      {/* Column 1: Product Info */}
      <Link to={`/dashboard/orders/${order._id}`} className="flex items-center gap-4">
        <img
          src={firstItem.image || 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No'}
          alt={firstItem.name || 'Product'}
          className="w-20 h-20 rounded-xl object-cover bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
          loading="lazy"
        />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-base">
            {firstItem.name || 'Product Item'}
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {firstItem.variant || 'Standard'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            Qty: {firstItem.quantity || 1}
          </p>
          {totalItems > 1 && (
            <span className="inline-block mt-1 text-[11px] bg-gray-50 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
              +{totalItems - 1} more items
            </span>
          )}
        </div>
      </Link>

      {/* Column 2: Order ID & Date */}
      <div className="flex flex-col gap-2 min-w-[120px]">
        <div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 block uppercase tracking-wider font-medium">Order ID</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
            #{order.orderNumber}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 block uppercase tracking-wider font-medium">Order Date</span>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Column 3: Amount & Payment */}
      <div className="flex flex-col gap-2 min-w-[100px]">
        <div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 block uppercase tracking-wider font-medium">Amount</span>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            ₹{order.total?.toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 block uppercase tracking-wider font-medium">Payment</span>
          <span className={`text-xs font-semibold ${isCancelled ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
            {isCancelled ? 'Refunded' : (order.paymentStatus || 'Paid')}
          </span>
        </div>
      </div>

      {/* Column 4: Status Badging & Timeline Context */}
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
            <StatusIcon size={13} />
            {status.label}
          </span>
        </div>
        
        {isDelivered && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Delivered on <span className="font-medium text-gray-700 dark:text-gray-300">{formattedDate}</span>
          </p>
        )}
        {(isShipped || isOutForDelivery) && order.expectedDelivery && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Expected Delivery <span className="font-medium text-gray-700 dark:text-gray-300">
              {new Date(order.expectedDelivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </p>
        )}
        {order.status === 'Processing' && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">Will be shipped soon</p>
        )}
        {isCancelled && (
          <p className="text-xs text-red-500/80 mt-0.5">Cancelled on {formattedDate}</p>
        )}
      </div>

      {/* Column 5: Right Hand Side View/Track Actions – Teal theme */}
      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 dark:border-gray-800">
        <Link
          to={`/dashboard/orders/${order._id}`}
          className="flex-1 md:flex-none text-center px-4 py-2 border border-[#00C2D6]/40 dark:border-[#00C2D6]/40 text-[#00C2D6] rounded-xl text-xs font-semibold hover:bg-[#E6F9FA] dark:hover:bg-[#00C2D6]/20 transition whitespace-nowrap"
        >
          View Details
        </Link>
        {!isCancelled && !isDelivered && (
          <Link
            to={`/dashboard/track/${order.orderNumber}`}
            className="flex-1 md:flex-none text-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition whitespace-nowrap"
          >
            Track Order
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────
const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndPaginate();
  }, [orders, searchTerm, statusFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      const data = await userOrderService.fetchMyOrders();
      const enriched = data.map((o) => ({
        ...o,
        expectedDelivery:
          o.status === 'Shipped' || o.status === 'Out for Delivery'
            ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        deliveredDate: o.status === 'Delivered' ? o.createdAt : null,
        cancelledDate: o.status === 'Cancelled' ? o.createdAt : null,
      }));
      setOrders(enriched);
    } catch (error) {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginate = () => {
    let filtered = [...orders];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          (o.orderNumber?.toLowerCase().includes(term) || false) ||
          (o.items?.some((i) => i.name?.toLowerCase().includes(term)) || false)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    setFilteredOrders(paginated);
  };

  const handleCancel = async (order) => {
    if (!order?._id) return;
    if (!window.confirm(`Cancel order #${order.orderNumber}?`)) return;
    try {
      await userOrderService.cancelOrder(order._id, 'Customer requested cancellation');
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error) {
      toast.error(error?.message || 'Failed to cancel order');
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  // Stats Counters
  const tabStats = {
    all: orders.length,
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Processing: orders.filter((o) => o.status === 'Processing').length,
    Shipped: orders.filter((o) => o.status === 'Shipped').length,
    'Out for Delivery': orders.filter((o) => o.status === 'Out for Delivery').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  const tabs = [
    { key: 'all', label: 'All Orders', count: tabStats.all },
    { key: 'Processing', label: 'Processing', count: tabStats.Processing },
    { key: 'Shipped', label: 'Shipped', count: tabStats.Shipped },
    { key: 'Out for Delivery', label: 'Out for Delivery', count: tabStats['Out for Delivery'] },
    { key: 'Delivered', label: 'Delivered', count: tabStats.Delivered },
    { key: 'Cancelled', label: 'Cancelled', count: tabStats.Cancelled },
  ];

  const totalFilteredCount = orders.filter((o) => (statusFilter === 'all' ? true : o.status === statusFilter)).length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#00C2D6] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-2 py-2 space-y-6">
      {/* Search Header Group */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            My Orders
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Track, view and manage all your orders in one place.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 dark:border-gray-800 rounded-xl text-xs focus:ring-1 focus:ring-[#00C2D6] focus:bg-white outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition shadow-sm">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Modern Top Row Tabs Bar – Teal theme */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-2 flex flex-wrap items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`relative px-4 py-3.5 text-xs font-semibold transition-all flex items-center gap-2 outline-none whitespace-nowrap ${
                isActive
                  ? 'text-[#00C2D6]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-[#E6F9FA] text-[#00C2D6]' : 'bg-gray-50 text-gray-400'
              }`}>
                {tab.count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00C2D6]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Order Grid List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Package size={44} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {orders.length === 0 ? 'No orders placed yet' : 'No matching orders found'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
              {orders.length === 0
                ? "Looks like you haven't placed any orders yet."
                : 'Try altering your keywords or setting adjustments.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order, idx) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancel={handleCancel}
              onView={handleView}
              index={idx}
            />
          ))
        )}
      </div>

      {/* Pagination Controls Footer Row – Teal theme */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={14} />
            </button>
            {[...Array(totalPages).keys()].map((num) => {
              const targetPage = num + 1;
              const isCurrent = currentPage === targetPage;
              return (
                <button
                  key={num}
                  onClick={() => handlePageChange(targetPage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-[#00C2D6] text-white'
                      : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {targetPage}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal Layer */}
      <AnimatePresence>
        {modalOpen && (
          <OrderDetailModal
            isOpen={modalOpen}
            onClose={closeModal}
            order={selectedOrder}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ORDER DETAIL MODAL – Teal theme ──────────────────
const OrderDetailModal = ({ isOpen, onClose, order, onCancel }) => {
  if (!isOpen || !order) return null;

  const status = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = status.icon;
  const total = order.total || 0;
  const subtotal = order.subtotal || 0;
  const shipping = order.shipping || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto z-10 border border-gray-100 dark:border-gray-800"
      >
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Order Details
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">#{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Line */}
          <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 font-medium">Status</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${status.bg} ${status.color} ${status.border}`}>
              <StatusIcon size={11} /> {status.label}
            </span>
          </div>

          {/* Shipping Address */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Address</h4>
            <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className="font-medium">{order.shippingAddress?.address || 'N/A'}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items</h4>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5 last:pb-0">
                  <img
                    src={item.image || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=No'}
                    alt={item.name || 'Product'}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.name || 'Product'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.variant || 'Standard'}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    ₹{item.price || 0} × {item.quantity || 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals – Teal total */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="font-medium text-gray-900 dark:text-white">₹{shipping.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-gray-200">Total</span>
              <span className="text-[#00C2D6]">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2 pt-2">
            {(order.status === 'Pending' || order.status === 'Processing') && (
              <button
                onClick={() => {
                  onCancel(order);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Ban size={13} /> Cancel Order
              </button>
            )}
            {order.status === 'Delivered' && (
              <button
                onClick={() => toast.success('Downloading Invoice...')}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Download size={13} /> Invoice
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserOrders;