import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const NotificationCard = () => {
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    newUsers: true,
    salesReport: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("adminNotificationPrefs");
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  const toggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("adminNotificationPrefs", JSON.stringify(updated));
  };

  const items = [
    { key: "newOrders", title: "New Order Notifications", description: "Get notified when new orders are placed" },
    { key: "lowStock", title: "Low Stock Alerts", description: "Get notified when product stock is low" },
    { key: "newUsers", title: "New User Registrations", description: "Get notified when new users register" },
    { key: "salesReport", title: "Daily Sales Report", description: "Receive daily sales report via email" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Bell size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Notification Preferences</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <ToggleSwitch enabled={notifications[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCard;