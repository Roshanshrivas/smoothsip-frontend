import React from "react";
import { Plus, Tag, ShoppingBag, Users, BarChart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActionsCard = () => {
  const navigate = useNavigate();

  const actions = [
    { icon: Plus, label: "Add New Product", path: "/admin/products" },
    { icon: Tag, label: "Create Coupon", path: "/admin/coupons" },
    { icon: ShoppingBag, label: "View All Orders", path: "/admin/orders" },
    { icon: Users, label: "Manage Users", path: "/admin/users" },
    { icon: BarChart, label: "Open Analytics", path: "/admin/analytics" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Quick Actions</h3>
      </div>

      {/* Actions list – no borders, clean spacing */}
      <div className="p-4 space-y-1">
        {actions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between p-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className="text-gray-400 group-hover:text-orange-500 transition" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-400 transition" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;