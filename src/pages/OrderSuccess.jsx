// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, IndianRupee, Calendar, MapPin, Truck } from 'lucide-react';
import { userOrderService } from '../services/userOrderService';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await userOrderService.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="text-gray-500 mt-2">Thank you for your order. We'll notify you when it ships.</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left space-y-2">
          <p><span className="font-semibold">Order Number:</span> #{order.orderNumber}</p>
          <p><span className="font-semibold">Total:</span> ₹{order.total}</p>
          <p><span className="font-semibold">Payment Method:</span> {order.paymentMethod}</p>
          <p><span className="font-semibold">Status:</span> {order.status}</p>
          <div className="mt-4">
            <p className="font-semibold">Shipping Address:</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard/orders">
            <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition">
              View My Orders
            </button>
          </Link>
          <Link to="/allproducts">
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;