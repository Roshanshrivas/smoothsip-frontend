// src/pages/TrackOrder.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  MapPin,
  Calendar,
  ArrowLeft,
  Printer,
  ShoppingBag,
  CreditCard,
  User,
  Mail,
  Phone,
  IndianRupee,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { userOrderService } from "../../services/userOrderService";

// ---------- Status Timeline Configuration ----------
const STATUS_STEPS = [
  { key: "Pending", label: "Order Confirmed", icon: Clock, color: "text-yellow-500", description: "Your order has been received and is being processed." },
  { key: "Processing", label: "Processing", icon: Package, color: "text-blue-500", description: "Your order is being prepared for shipment." },
  { key: "Shipped", label: "In Transit", icon: Truck, color: "text-purple-500", description: "Your order has been dispatched and is on its way." },
  { key: "Delivered", label: "Delivered", icon: CheckCircle, color: "text-green-500", description: "Your order has been successfully delivered." },
];

const STATUS_COLORS = {
  Pending: "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700",
  Processing: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700",
  Shipped: "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700",
  Delivered: "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
  Cancelled: "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700",
};

const paymentStatusConfig = {
  Paid: "text-green-600 dark:text-green-400",
  Unpaid: "text-red-600 dark:text-red-400",
  Refunded: "text-gray-500 dark:text-gray-400",
};

const TimelineStep = ({ step, index, currentIndex, isCancelled }) => {
  const isCompleted = index < currentIndex && !isCancelled;
  const isActive = index === currentIndex && !isCancelled;
  const isUpcoming = index > currentIndex && !isCancelled;
  const Icon = step.icon;

  return (
    <div className="relative flex items-start gap-4 print:gap-2">
      <div className="flex flex-col items-center">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-500 print:w-8 print:h-8
            ${isCompleted ? "bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30" : ""}
            ${isActive ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500 text-orange-500 animate-pulse" : ""}
            ${isUpcoming ? "bg-gray-100 dark:bg-gray-800 text-gray-400" : ""}
            ${isCancelled && index === currentIndex ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-500" : ""}
            ${isCancelled && index < currentIndex ? "bg-gray-200 dark:bg-gray-700 text-gray-500" : ""}
          `}
        >
          {isCompleted ? <CheckCircle size={18} className="print:w-4 print:h-4" /> : <Icon size={18} className="print:w-4 print:h-4" />}
        </div>
        {index < STATUS_STEPS.length - 1 && (
          <div
            className={`w-0.5 h-12 transition-all duration-700 print:h-8 ${
              isCompleted || isActive ? "bg-orange-300 dark:bg-orange-700" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        )}
      </div>
      <div className="pt-0.5 pb-6 print:pb-2">
        <p className={`font-semibold text-sm print:text-xs ${isCompleted || isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {step.label}
        </p>
        {isActive && (
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium animate-pulse print:hidden">
            Currently in progress
          </p>
        )}
        {isCancelled && index === currentIndex && (
          <p className="text-sm text-red-600 dark:text-red-400 font-medium print:text-xs">
            ⚠️ Order cancelled
          </p>
        )}
        <p className={`text-sm print:text-xs ${isCompleted || isActive ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
          {step.description}
        </p>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
const TrackOrder = () => {
  const { id, orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        let data;
        const identifier = id || orderNumber;

        if (!identifier) {
          setError("No tracking number provided");
          setLoading(false);
          return;
        }

        try {
          data = await userOrderService.getOrderById(identifier);
        } catch (err) {
          const allOrders = await userOrderService.fetchMyOrders();
          const found = allOrders.find(
            (o) => o.orderNumber === identifier || o._id === identifier
          );
          if (found) data = found;
          else throw new Error("Order not found");
        }

        setOrder(data);
        setError(null);
      } catch (err) {
        console.error("Track order error:", err);
        setError(err.message || "Order not found. Please check your tracking number.");
        toast.error("Order not found");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, orderNumber]);

  const handleCopyTracking = () => {
    const tracking = order?.trackingNumber;
    if (tracking) {
      navigator.clipboard.writeText(tracking);
      setCopied(true);
      toast.success("Tracking number copied!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00C2D6] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {error || "We couldn't find that order. Please check your tracking number."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard/orders"
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition shadow-sm"
            >
              My Orders
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = order.status || "Pending";
  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === "Cancelled";

  return (
    <div className="bg-gray-50 dark:bg-gray-950 py-2 px-4 sm:px-6 print:py-0 print:px-0 print:bg-white">
      <div className="mx-auto print:max-w-full print:mx-0">

        {/* ── Back Button (hidden on print) ── */}
        <button
          onClick={() => navigate(-1)}
          className="no-print inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* ── Page Header ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6 print:rounded-none print:shadow-none print:border-0 print:p-4">
          <div className="flex flex-wrap items-start justify-between gap-4 print:gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 print:text-xl">
                <Package size={28} className="text-[#00C2D6] print:hidden" />
                Track Order
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm print:text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Order #{order.orderNumber || order.id}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar size={14} className="print:hidden" />
                  {new Date(order.createdAt || order.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-full border text-sm font-medium print:px-2 print:py-0.5 print:text-xs ${
                STATUS_COLORS[currentStatus] || "border-gray-300 bg-gray-50 text-gray-600"
              }`}
            >
              {currentStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Status Timeline ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6 print:rounded-none print:shadow-none print:border-0 print:p-3">
          <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-6 print:text-xs print:mb-2">
            Order Progress
          </h2>
          <div className="space-y-2 print:space-y-0">
            {STATUS_STEPS.map((step, idx) => (
              <TimelineStep
                key={step.key}
                step={step}
                index={idx}
                currentIndex={statusIndex}
                isCancelled={isCancelled}
              />
            ))}
          </div>
        </div>

        {/* ── Order Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 print:grid-cols-3 print:gap-2">
          {/* Customer */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 print:rounded-none print:shadow-none print:border print:p-2">
            <div className="flex items-center gap-3 print:gap-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center print:w-6 print:h-6">
                <User size={18} className="text-blue-500 print:w-4 print:h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-[10px]">Customer</p>
                <p className="font-medium text-gray-900 dark:text-white print:text-sm">{order.customer || order.name}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400 print:text-xs print:mt-1">
              <p className="flex items-center gap-2 print:gap-0.5"><Mail size={14} className="print:w-3 print:h-3" /> {order.email}</p>
              <p className="flex items-center gap-2 print:gap-0.5"><Phone size={14} className="print:w-3 print:h-3" /> {order.phone || "—"}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 print:rounded-none print:shadow-none print:border print:p-2">
            <div className="flex items-center gap-3 print:gap-1">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center print:w-6 print:h-6">
                <CreditCard size={18} className="text-green-500 print:w-4 print:h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-[10px]">Payment</p>
                <p className="font-medium text-gray-900 dark:text-white print:text-sm">{order.paymentMethod || "—"}</p>
              </div>
            </div>
            <div className="mt-3 text-sm print:text-xs print:mt-1">
              <span className={`font-medium ${paymentStatusConfig[order.paymentStatus] || "text-gray-500"}`}>
                {order.paymentStatus || "—"}
              </span>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 print:rounded-none print:shadow-none print:border print:p-2">
            <div className="flex items-center gap-3 print:gap-1">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center print:w-6 print:h-6">
                <Truck size={18} className="text-orange-500 print:w-4 print:h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-[10px]">Tracking</p>
                <p className="font-medium text-gray-900 dark:text-white print:text-sm">
                  {order.trackingNumber ? (
                    <span className="font-mono">{order.trackingNumber}</span>
                  ) : (
                    "Not assigned"
                  )}
                </p>
              </div>
            </div>
            {order.trackingNumber && (
              <button
                onClick={handleCopyTracking}
                className="mt-3 flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition no-print"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy tracking number"}
              </button>
            )}
          </div>
        </div>

        {/* ── Address & Total ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:grid-cols-2 print:gap-2">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 print:rounded-none print:shadow-none print:border print:p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 print:text-xs print:mb-1">
              <MapPin size={18} className="text-gray-400 print:w-4 print:h-4" />
              Shipping Address
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 print:text-xs">
              <p>{order.shippingAddress?.address || order.address || "—"}</p>
              {order.shippingAddress?.city && (
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                </p>
              )}
              <p>{order.shippingAddress?.country || "India"}</p>
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 print:rounded-none print:shadow-none print:border print:p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 print:text-xs print:mb-1">
              <IndianRupee size={18} className="text-gray-400 print:w-4 print:h-4" />
              Order Summary
            </div>
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{order.shipping || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{order.tax || 0}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-base font-bold print:text-sm">
                <span className="text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-orange-500">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6 print:rounded-none print:shadow-none print:border print:p-3">
          <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-4 flex items-center gap-2 print:text-xs print:mb-2">
            <Package size={16} className="print:w-4 print:h-4" />
            Items ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-200">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between py-4 first:pt-0 last:pb-0 gap-3 print:py-2 print:first:pt-0 print:last:pb-0">
                <div className="flex items-center gap-4 print:gap-2">
                  <img
                    src={item.image || "https://placehold.co/56x56/f3f4f6/9ca3af?text=No"}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 print:w-10 print:h-10"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white print:text-sm">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-xs">SKU: {item.sku || "—"}</p>
                    {item.customization?.text && (
                      <p className="text-xs text-orange-500 print:text-[10px]">Custom: {item.customization.text}</p>
                    )}
                  </div>
                </div>
                <div className="text-right print:text-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400 print:text-xs">Qty: {item.quantity}</p>
                  <p className="font-medium text-gray-900 dark:text-white">₹{item.price?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action Buttons (hidden on print) ── */}
        <div className="flex flex-wrap gap-3 no-print">
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00C2D6] hover:bg-[#00a8b9] text-white rounded-xl font-medium transition shadow-sm hover:shadow-md"
          >
            <ShoppingBag size={18} /> My Orders
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 hover:text-white dark:text-gray-300 hover:bg-[#00C2D6] dark:hover:bg-[#00a8b9] rounded-xl font-medium transition"
          >
            <Printer size={18} /> Print
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 hover:text-white dark:text-gray-300 hover:bg-[#00C2D6] dark:hover:bg-gray-700 rounded-xl font-medium transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* ── Global Print Styles ── */}
      <style>{`
        @media print {
          /* Remove backgrounds, shadows, and unnecessary elements */
          .no-print { display: none !important; }
          
          body { background: white !important; margin: 0; padding: 0; }
          .bg-white, .dark\\:bg-gray-900, .bg-gray-50, .dark\\:bg-gray-950 { background: white !important; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
          .border { border-color: #e5e7eb !important; }
          
          /* Hide navbar, footer, sidebar when printing */
          nav, footer, .navbar, .sidebar, .topbar { display: none !important; }
          
          /* Adjust text colors for print */
          .text-gray-900, .dark\\:text-white, .text-gray-800 { color: black !important; }
          .text-gray-500, .dark\\:text-gray-400 { color: #4b5563 !important; }
          .text-orange-500 { color: #ea580c !important; }
          
          /* Ensure full-width layout */
          .max-w-5xl { max-width: 100% !important; }
          .px-4, .sm\\:px-6 { padding-left: 0 !important; padding-right: 0 !important; }
          .py-8 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          
          /* Card spacing */
          .p-6 { padding: 0.75rem !important; }
          .p-5 { padding: 0.5rem !important; }
          .mb-6 { margin-bottom: 0.5rem !important; }
          
          /* Timeline spacing */
          .space-y-2 > * + * { margin-top: 0 !important; }
          .pb-6 { padding-bottom: 0.25rem !important; }
          
          /* Grid adjustments */
          .grid { gap: 0.5rem !important; }
          
          /* Typography */
          .text-2xl { font-size: 1.25rem !important; }
          .text-sm { font-size: 0.7rem !important; }
          .text-xs { font-size: 0.6rem !important; }
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;