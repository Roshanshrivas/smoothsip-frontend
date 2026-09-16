// src/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Ban,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Download,
  IndianRupee,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userOrderService } from '../services/userOrderService';

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
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Main Component ──────────────────────────────────
const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await userOrderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel order #${order.orderNumber}?`)) return;
    try {
      await userOrderService.cancelOrder(order._id, 'Customer requested cancellation');
      toast.success('Order cancelled');
      fetchOrder();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const handleCopyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      toast.success('Tracking number copied!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order not found</h3>
        <Link to="/dashboard/orders" className="text-orange-500 hover:underline mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = status.icon;
  const isShippedOrOutForDelivery = order.status === 'Shipped' || order.status === 'Out for Delivery';
  const isDelivered = order.status === 'Delivered';
  const isCancellable = order.status === 'Pending' || order.status === 'Processing';
  const canTrack = isShippedOrOutForDelivery || isDelivered;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto px-2 sm:px-6 py-4"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/dashboard/orders" className="hover:text-[#00C2D6] transition flex items-center gap-1">
          <ArrowLeft size={16} /> Orders
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-gray-800 dark:text-white font-medium">Order #{order.orderNumber}</span>
      </nav>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Package size={28} className="text-[#01a1b3]" />
              Order #{order.orderNumber}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar size={14} /> {formatDate(order.createdAt)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
              >
                <StatusIcon size={14} />
                {status.label}
              </span>
            </div>
          </div>
          {canTrack && (
            <Link
              to={`/dashboard/track/${order.orderNumber}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              <Truck size={16} /> Track Order
            </Link>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Items */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Package size={16} /> Order Items
                </h3>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700"
                    >
                      <img
                        src={item.image || 'https://placehold.co/56x56/f3f4f6/9ca3af?text=No'}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        {item.customization?.text && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Custom: {item.customization.text}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {item.sku || '—'} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{item.price?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <MapPin size={16} /> Shipping Address
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {order.shippingAddress?.address || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Right column: Summary */}
            <div className="space-y-6">
              {/* Payment & Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CreditCard size={16} /> Payment & Customer
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{order.subtotal?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{order.shipping || 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-base font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Total</span>
                      <span className="text-orange-500">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="font-medium">{order.customer || order.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span>{order.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{order.phone || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Truck size={16} /> Tracking
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        📦 <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                      <button
                        onClick={handleCopyTracking}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <Link
                      to={`/dashboard/track/${order.orderNumber}`}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Truck size={14} /> Track your order
                    </Link>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {isCancellable && (
                    <button
                      onClick={handleCancel}
                      className="flex-1 min-w-[100px] px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <Ban size={16} /> Cancel Order
                    </button>
                  )}
                  {canTrack && (
                    <Link
                      to={`/dashboard/track/${order.orderNumber}`}
                      className="flex-1 min-w-[100px] px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> Track Order
                    </Link>
                  )}
                  {isDelivered && (
                    <button
                      onClick={() => toast.success('Downloading invoice...')}
                      className="flex-1 min-w-[100px] px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Download Invoice
                    </button>
                  )}
                  <Link
                    to="/dashboard/orders"
                    className="flex-1 min-w-[100px] px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .bg-gray-50, .dark\\:bg-gray-800\\/30 { background: #f9fafb !important; }
          .border { border-color: #e5e7eb !important; }
          .shadow-sm { box-shadow: none !important; }
          nav, .no-print { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default OrderDetail;