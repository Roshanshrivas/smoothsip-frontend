// src/pages/admin/OrderDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Printer,
  Download,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../ConfirmDialog";
import { orderService } from "../../../services/orderService";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrder(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError("Order not found");
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadOrder();
      }
    };
    const handleFocus = () => {
      loadOrder();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id]);

  const handleDelete = async () => {
    await orderService.deleteOrder(id);
    setDeleteModalOpen(false);
    toast.success("Order deleted");
    navigate("/admin/orders");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Order not found</h2>
        <Link
          to="/admin/orders"
          className="text-orange-500 hover:underline mt-2 inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Build address string from nested shippingAddress
  const shippingAddress = order.shippingAddress || {};
  const addressString = shippingAddress.address
    ? `${shippingAddress.address}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pinCode || ''}`
    : order.address || '—';

  const statusConfig = {
    Delivered: {
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    Processing: { icon: Clock, color: "text-blue-500", bg: "bg-blue-100" },
    Shipped: { icon: Truck, color: "text-orange-500", bg: "bg-orange-100" },
    Pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100" },
    Cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
  };
  const StatusIcon = statusConfig[order.status]?.icon || Package;
  const statusColor = statusConfig[order.status]?.color || "text-gray-500";
  const statusBg = statusConfig[order.status]?.bg || "bg-gray-100";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/admin/orders"
          className="hover:text-orange-600 flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Orders
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">#{order.orderNumber || order.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Order #{order.orderNumber || order.id}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusBg} ${statusColor}`}
            >
              <StatusIcon size={14} />
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
          >
            <XCircle size={16} /> Delete
          </button>
          <Link
            to={`/admin/orders/${id}/edit`}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Edit size={16} /> Edit Order
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <IndianRupee size={14} />
            Total
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ₹{order.total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Package size={16} /> Items
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {order.items?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CreditCard size={16} /> Payment
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {order.paymentMethod || "—"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Truck size={16} /> Fulfillment
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {order.fulfillmentStatus || "—"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <User size={16} /> Customer
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {order.customer}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail size={14} /> {order.email || "—"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Phone size={14} /> {order.phone || "—"}
              </p>
              {addressString && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5" /> {addressString}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <CreditCard size={16} /> Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">
                  {order.paymentMethod || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${order.paymentStatus === "Paid" ? "text-green-600" : "text-red-500"}`}
                >
                  {order.paymentStatus || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <FileText size={16} /> Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  ₹{order.subtotal || order.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">₹{order.shipping || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-orange-600">
                  ₹{order.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Package size={16} /> Order Items
              </h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition"
              >
                <Printer size={16} /> Print
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {order.items?.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.image ||
                                "https://placehold.co/40x40/FFF4E6/78350F?text=No"
                              }
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <span className="font-medium text-gray-800 dark:text-white">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {item.sku || "—"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3 text-right">₹{item.price}</td>
                        <td className="px-5 py-3 text-right font-semibold">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order #${order.id}? This action cannot be undone.`}
      />
    </div>
  );
};

export default OrderDetail;
