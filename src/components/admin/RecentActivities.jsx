// src/components/admin/RecentActivities.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  Eye,
  Clock,
  Activity,
  ArrowRight,
} from "lucide-react";

const getActivityIcon = (type) => {
  const icons = {
    order: <ShoppingCart size={14} className="text-blue-500" />,
    product: <Package size={14} className="text-purple-500" />,
    customer: <Users size={14} className="text-emerald-500" />,
    shipped: <Truck size={14} className="text-amber-500" />,
    review: <Eye size={14} className="text-pink-500" />,
    activity: <Activity size={14} className="text-gray-500" />,
  };
  return icons[type] || <Clock size={14} className="text-gray-400" />;
};

const getDotColor = (type) => {
  const colors = {
    order: "bg-blue-500",
    product: "bg-purple-500",
    customer: "bg-emerald-500",
    shipped: "bg-amber-500",
    review: "bg-pink-500",
    activity: "bg-gray-500",
  };
  return colors[type] || "bg-gray-400";
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 15 } },
};

const RecentActivities = ({ activities, itemVariants: parentVariants }) => {
  const safeActivities = Array.isArray(activities) ? activities : [];

  return (
    <motion.div
      variants={parentVariants}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all duration-200 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activities</h3>
        {safeActivities.length > 0 && (
          <span className="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500">
            {safeActivities.length} updates
          </span>
        )}
      </div>

      <motion.div
        className="flex-1 space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {safeActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activities</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Activities will appear here</p>
          </div>
        ) : (
          safeActivities.slice(0, 6).map((activity, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex items-start gap-3 group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <div className={`w-8 h-8 rounded-full ${getDotColor(activity.icon)}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {getActivityIcon(activity.icon)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${getDotColor(activity.icon)} border-2 border-white dark:border-gray-900`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock size={10} />
                  {activity.time}
                </p>
              </div>

              {activity.status && (
                <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {activity.status}
                </span>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/admin/orders"
          className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition group"
        >
          View all activities
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default RecentActivities;