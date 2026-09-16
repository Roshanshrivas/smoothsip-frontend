// src/pages/admin/BroadcastCenter.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Calendar,
  Download,
  Eye,
  Edit,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Users,
  Send,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Clock as ClockIcon,
  Award,
  BarChart3,
  Activity,
  ThumbsUp,
  ShoppingBag,
  Gift,
  Rocket,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BroadcastTable from "../../components/admin/broadcast/BroadcastTable";
import { broadcastService } from "../../services/broadcastService";

// ==============================================
// BEST PRACTICES (Static)
// ==============================================

const bestPractices = [
  {
    id: 1,
    title: "Target Audience",
    description: "Segment your audience for better engagement and higher conversion rates.",
    icon: Target,
    color: "blue",
  },
  {
    id: 2,
    title: "Keep Messages Short",
    description: "Concise messages get more attention. Aim for 150-200 characters.",
    icon: MessageCircle,
    color: "green",
  },
  {
    id: 3,
    title: "Best Time To Send",
    description: "Send campaigns between 10 AM - 12 PM for optimal open rates.",
    icon: ClockIcon,
    color: "orange",
  },
  {
    id: 4,
    title: "Track Performance",
    description: "Monitor CTR and conversion rates to optimize future campaigns.",
    icon: BarChart3,
    color: "purple",
  },
];

const tabs = [
  { id: "all", label: "All Campaigns" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "sms", label: "SMS" },
  { id: "push", label: "Push Notification" },
];

// ==============================================
// REUSABLE STATS CARD
// ==============================================

const StatsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const isPositive = stat.change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight">
            {stat.value}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-xs font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {isPositive ? "↑" : "↓"} {Math.abs(stat.change)}%
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">from last month</span>
          </div>
        </div>
        <div className={`
          w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
          bg-${stat.color}-100 dark:bg-${stat.color}-900/30
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon size={20} className={`text-${stat.color}-500 dark:text-${stat.color}-400`} />
        </div>
      </div>
    </motion.div>
  );
};

// ==============================================
// MAIN COMPONENT
// ==============================================

const BroadcastCenter = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch campaigns and stats on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch campaigns
      const campaignsResponse = await broadcastService.getBroadcasts();
      setCampaigns(campaignsResponse.broadcasts || []);

      // Fetch stats
      const statsResponse = await broadcastService.getBroadcastStats();
      setStats(statsResponse);
    } catch (error) {
      toast.error(error?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Build statsData from real API response
  const statsData = stats
    ? [
        {
          id: 1,
          label: "Total Campaigns",
          value: stats.totalCampaigns || 0,
          change: stats.campaignChange || 0,
          icon: Send,
          color: "blue",
        },
        {
          id: 2,
          label: "Audience Reach",
          value: stats.audienceReach ? stats.audienceReach.toLocaleString() : "0",
          change: stats.reachChange || 0,
          icon: Users,
          color: "green",
        },
        {
          id: 3,
          label: "Messages Sent",
          value: stats.totalSent ? stats.totalSent.toLocaleString() : "0",
          change: stats.sentChange || 0,
          icon: Mail,
          color: "purple",
        },
        {
          id: 4,
          label: "Open Rate",
          value: stats.openRate ? `${stats.openRate}%` : "0%",
          change: stats.openRateChange || 0,
          icon: Eye,
          color: "orange",
        },
        {
          id: 5,
          label: "Click Rate",
          value: stats.clickRate ? `${stats.clickRate}%` : "0%",
          change: stats.clickRateChange || 0,
          icon: TrendingUp,
          color: "emerald",
        },
      ]
    : [];

  // Filter logic
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesTab = activeTab === "all" || camp.channel === activeTab;
      const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           camp.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAudience = audienceFilter === "all" || camp.audience === audienceFilter;
      const matchesStatus = statusFilter === "all" || camp.status === statusFilter;
      return matchesTab && matchesSearch && matchesAudience && matchesStatus;
    });
  }, [activeTab, searchTerm, audienceFilter, statusFilter, campaigns]);

  // Handle actions
  const handleAction = async (action, campaign) => {
    if (action === "edit") {
      navigate(`/admin/broadcast/${campaign.id}/edit`);
      return;
    }
    if (action === "delete") {
      if (!window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) return;
      try {
        await broadcastService.deleteBroadcast(campaign.id);
        setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
        // Refresh stats after deletion
        const statsResponse = await broadcastService.getBroadcastStats();
        setStats(statsResponse);
        toast.success("Campaign deleted successfully!");
      } catch (error) {
        toast.error(error?.message || "Failed to delete campaign");
      }
      return;
    }
    if (action === "view") {
      return; // handled by modal
    }
    if (action === "duplicate") {
      try {
        await broadcastService.duplicateBroadcast(campaign.id);
        await fetchData();
        toast.success("Campaign duplicated successfully!");
      } catch (error) {
        toast.error(error?.message || "Failed to duplicate campaign");
      }
      return;
    }
    if (action === "analytics") {
      try {
        const analytics = await broadcastService.getBroadcastAnalytics(campaign.id);
        toast.info(`Analytics loaded for "${campaign.name}"`);  
      } catch (error) {
        toast.error(error?.message || "Failed to load analytics");
      }
      return;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Broadcast Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create and manage marketing campaigns across multiple channels.
          </p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/admin/broadcast/create")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex-shrink-0"
        >
          <Plus size={18} />
          Create Broadcast
        </motion.button>
      </div>

      {/* ===== STATS CARDS ===== */}
      {statsData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statsData.map((stat, idx) => (
            <StatsCard key={stat.id} stat={stat} index={idx} />
          ))}
        </div>
      )}

      {/* ===== FILTER BAR ===== */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          >
            <option value="all">All Audiences</option>
            <option value="All Customers">All Customers</option>
            <option value="Active Users">Active Users</option>
            <option value="App Users">App Users</option>
            <option value="Design Enthusiasts">Design Enthusiasts</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />

          <button
            onClick={async () => {
              try {
                const data = await broadcastService.exportBroadcastData({});
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'broadcasts.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success("Export started!");
              } catch (error) {
                toast.error("Failed to export");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* ===== TABLE CARD WITH TABS ===== */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-3 border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
            {filteredCampaigns.length} campaigns
          </span>
        </div>

        <BroadcastTable
          campaigns={filteredCampaigns}
          onAction={handleAction}
          onRefresh={fetchData}
        />
      </div>

      {/* ===== BROADCAST BEST PRACTICES ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Broadcast Best Practices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestPractices.map((practice) => {
            const Icon = practice.icon;
            const colorClasses = {
              blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
              green: "bg-green-50 dark:bg-green-900/20 text-green-500",
              orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-500",
              purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-500",
            };
            return (
              <motion.div
                key={practice.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${colorClasses[practice.color]} flex items-center justify-center mb-3`}>
                  <Icon size={18} />
                </div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{practice.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{practice.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BroadcastCenter;