import React from "react";
import { MessageCircle, Mail, Bell, History, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MarketingCard = () => {
  const navigate = useNavigate();
  
  const campaigns = [
    { title: "Send WhatsApp Campaign", icon: MessageCircle, color: "text-green-600", bgHover: "hover:bg-green-50", path: "/admin/broadcast?tab=whatsapp" },
    { title: "Send Email Campaign", icon: Mail, color: "text-blue-600", bgHover: "hover:bg-blue-50", path: "/admin/broadcast?tab=email" },
    { title: "Send Push Notification", icon: Bell, color: "text-orange-600", bgHover: "hover:bg-orange-50", path: "/admin/broadcast?tab=push" },
    { title: "View Campaign History", icon: History, color: "text-purple-600", bgHover: "hover:bg-purple-50", path: "/admin/broadcast" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Send size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Marketing & Broadcast</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">Send campaigns and promotions to customers</p>
      </div>

      {/* Campaign list */}
      <div className="p-4 space-y-2">
        {campaigns.map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${item.bgHover} group`}
          >
            <item.icon size={18} className={`${item.color} group-hover:scale-110 transition`} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarketingCard;