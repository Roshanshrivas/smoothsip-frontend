// src/components/admin/broadcast/ChannelBadge.jsx
import React from "react";
import { Mail, MessageCircle, Smartphone, Bell } from "lucide-react";

const channelConfig = {
  email: { icon: Mail, color: "orange", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500" },
  whatsapp: { icon: MessageCircle, color: "green", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-500" },
  sms: { icon: Smartphone, color: "blue", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500" },
  push: { icon: Bell, color: "purple", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-500" },
};

export const ChannelBadge = ({ channel }) => {
  const config = channelConfig[channel];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={12} />
      <span className="capitalize">{channel}</span>
    </span>
  );
};