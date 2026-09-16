// src/components/admin/broadcast/CampaignStatusBadge.jsx
import React from "react";
import { CheckCircle, Activity, Clock, Edit } from "lucide-react";

const statusConfig = {
  completed: { label: "Completed", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
  running: { label: "Running", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Activity },
  scheduled: { label: "Scheduled", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", icon: Clock },
  draft: { label: "Draft", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-800/50", icon: Edit },
};

export const CampaignStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};