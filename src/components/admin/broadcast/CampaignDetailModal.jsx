// src/components/admin/broadcast/CampaignDetailModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Edit,
  Copy,
  Trash2,
  Send,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { ChannelBadge } from "./ChannelBadge";

const channelIcons = {
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
  push: Bell,
};

const CampaignDetailModal = ({ isOpen, onClose, campaign, onAction }) => {
  if (!isOpen || !campaign) return null;

  const Icon = channelIcons[campaign.channel] || Mail;
  const statusIconMap = {
    completed: CheckCircle,
    running: Clock,
    scheduled: Calendar,
    draft: Edit,
  };
  const StatusIcon = statusIconMap[campaign.status] || CheckCircle;
  const statusColorMap = {
    completed: "text-green-500",
    running: "text-blue-500",
    scheduled: "text-orange-500",
    draft: "text-gray-400",
  };

  const handleAction = (action) => {
    onAction(action, campaign);
    if (action !== "view") onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl">{campaign.thumbnail || "📢"}</span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {campaign.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <ChannelBadge channel={campaign.channel} />
                      <CampaignStatusBadge status={campaign.status} />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {campaign.created}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                  <Users size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Audience</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {campaign.audience}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                  <Send size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {campaign.sent}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                  <CheckCircle size={16} className="mx-auto text-green-400 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {campaign.delivered > 0 ? campaign.delivered.toLocaleString() : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                  <TrendingUp size={16} className="mx-auto text-orange-400 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {campaign.ctr > 0 ? `${campaign.ctr}%` : "—"}
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Message Preview
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {campaign.message}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.created}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
                  <StatusIcon size={16} className={statusColorMap[campaign.status] || "text-gray-400"} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {campaign.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => handleAction("edit")}
                  className="flex-1 min-w-[80px] px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleAction("duplicate")}
                  className="flex-1 min-w-[80px] px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> Duplicate
                </button>
                <button
                  onClick={() => handleAction("analytics")}
                  className="flex-1 min-w-[80px] px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition flex items-center justify-center gap-2"
                >
                  <BarChart3 size={16} /> Analytics
                </button>
                <button
                  onClick={() => handleAction("delete")}
                  className="flex-1 min-w-[80px] px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CampaignDetailModal;