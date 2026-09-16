import React, { useState, useEffect } from "react";
import { Activity, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentActivityCard = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("adminRecentActivities");
    if (saved) {
      setActivities(JSON.parse(saved));
    } else {
      const defaultActivities = [
        { id: 1, action: "Logged in from Chrome Browser", time: "Today, 10:35 AM", location: "Kolkata, India" },
        { id: 2, action: "Updated product prices", time: "Yesterday, 04:20 PM", location: "Kolkata, India" },
        { id: 3, action: "Added new product: Matte Black Tumbler", time: "2 days ago", location: "Kolkata, India" },
        { id: 4, action: "Created new coupon: SUMMER25", time: "3 days ago", location: "Kolkata, India" },
      ];
      setActivities(defaultActivities);
      localStorage.setItem("adminRecentActivities", JSON.stringify(defaultActivities));
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Activity size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Recent Account Activity</h3>
        </div>
        <button 
          onClick={() => navigate("/admin/activity-log")} 
          className="text-orange-500 text-sm hover:underline"
        >
          View All Activity
        </button>
      </div>

      {/* Activity list */}
      <div className="p-5 space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Activity size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-800">{activity.action}</h4>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {activity.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {activity.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityCard;