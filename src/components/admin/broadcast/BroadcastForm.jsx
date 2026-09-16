// src/pages/admin/BroadcastForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Send,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Users,
  Calendar,
  Clock,
  Image,
  X,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { broadcastService } from "../../../services/broadcastService";
import { userService } from "../../../services/userService";

// ==============================================
// CHANNEL OPTIONS
// ==============================================
const channelOptions = [
  { value: "email", label: "Email", icon: Mail, color: "orange" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "green" },
  { value: "sms", label: "SMS", icon: Smartphone, color: "blue" },
  { value: "push", label: "Push Notification", icon: Bell, color: "purple" },
];

const statusOptions = [
  { value: "draft", label: "Draft", icon: Edit },
  { value: "scheduled", label: "Scheduled", icon: Calendar },
  { value: "running", label: "Send Now", icon: Send },
];

// ==============================================
// MAIN COMPONENT
// ==============================================
const BroadcastForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("email");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("draft");

  const [audienceOptions, setAudienceOptions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    channel: "email",
    audience: "all",
    audienceCount: 0,
    message: "",
    subject: "",
    status: "draft",
    scheduledDate: "",
    scheduledTime: "",
    thumbnailImage: "",
    thumbnailFile: null,
  });

  // Fetch audience counts on mount
  useEffect(() => {
    const fetchAudienceCounts = async () => {
      try {
        const counts = await userService.getAudienceCounts();
        const options = [
          { value: "all", label: "All Customers", count: counts.all || 0 },
          { value: "active", label: "Active Users", count: counts.active || 0 },
          { value: "subscribed", label: "Subscribed Users", count: counts.subscribed || 0 },
          { value: "app", label: "App Users", count: counts.app || 0 },
          { value: "inactive", label: "Inactive Users", count: counts.inactive || 0 },
          { value: "design", label: "Design Enthusiasts", count: counts.design || 0 },
        ];
        setAudienceOptions(options);
        const defaultAudience = options.find(o => o.value === 'all');
        if (defaultAudience) {
          setFormData(prev => ({ ...prev, audienceCount: defaultAudience.count }));
        }
      } catch (error) {
        console.warn('Failed to fetch audience counts, using fallback');
        const fallbackOptions = [
          { value: "all", label: "All Customers", count: 0 },
          { value: "active", label: "Active Users", count: 0 },
          { value: "subscribed", label: "Subscribed Users", count: 0 },
          { value: "app", label: "App Users", count: 0 },
          { value: "inactive", label: "Inactive Users", count: 0 },
          { value: "design", label: "Design Enthusiasts", count: 0 },
        ];
        setAudienceOptions(fallbackOptions);
      }
    };
    fetchAudienceCounts();
  }, []);

  // Load existing campaign data for editing
  useEffect(() => {
    if (isEditing && id) {
      const loadCampaign = async () => {
        try {
          const response = await broadcastService.getBroadcastById(id);
          const data = response.broadcast;
          setFormData({
            name: data.name,
            channel: data.channel,
            audience: data.audience || 'all',
            audienceCount: data.audienceCount || 0,
            message: data.message,
            subject: data.subject || '',
            status: data.status || 'draft',
            scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
            scheduledTime: data.scheduledDate ? data.scheduledDate.split('T')[1]?.slice(0, 5) : '',
            thumbnailImage: data.thumbnailImage || '',
            thumbnailFile: null,
          });
          setSelectedChannel(data.channel);
          setSelectedAudience(data.audience || 'all');
          setSelectedStatus(data.status || 'draft');
        } catch (error) {
          toast.error(error?.message || "Failed to load campaign");
          navigate("/admin/broadcast");
        } finally {
          setLoading(false);
        }
      };
      loadCampaign();
    }
  }, [id, isEditing, navigate]);

  // ─── Handlers ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    setFormData((prev) => ({ ...prev, channel }));
  };

  const handleAudienceChange = (audience) => {
    const selected = audienceOptions.find((a) => a.value === audience);
    setSelectedAudience(audience);
    setFormData((prev) => ({
      ...prev,
      audience,
      audienceCount: selected?.count || 0,
    }));
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, WEBP, or SVG images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        thumbnailImage: event.target.result,
        thumbnailFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnailImage: "",
      thumbnailFile: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ FIX: Add guard for id
  const handleDelete = async () => {
    if (!id) {
      toast.error("Invalid campaign ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await broadcastService.deleteBroadcast(id);
      toast.success("Campaign deleted successfully!");
      navigate("/admin/broadcast");
    } catch (error) {
      toast.error(error?.message || "Failed to delete campaign");
    }
  };

  // ✅ FIX: Add guard for id
  const handleSendNow = async () => {
    if (!id) {
      toast.error("Please save the campaign first before sending");
      return;
    }
    if (!window.confirm(`Send "${formData.name}" now?`)) return;

    setSending(true);
    try {
      const response = await broadcastService.sendBroadcast(id);
      toast.success(`Broadcast sent! Sent to ${response.sentCount || 0} users`);
      navigate("/admin/broadcast");
    } catch (error) {
      toast.error(error?.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  // ✅ FIX: Use `_id` for newly created campaign
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }
    if (selectedChannel === "email" && !formData.subject.trim()) {
      toast.error("Subject is required for email campaigns");
      return;
    }
    if (selectedStatus === "scheduled" && !formData.scheduledDate) {
      toast.error("Scheduled date is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        channel: selectedChannel,
        audience: selectedAudience,
        audienceCount: formData.audienceCount,
        message: formData.message,
        subject: formData.subject || '',
        status: selectedStatus,
        scheduledDate: selectedStatus === 'scheduled'
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime || '00:00'}`).toISOString()
          : null,
        thumbnailImage: formData.thumbnailImage,
      };

      if (isEditing) {
        await broadcastService.updateBroadcast(id, payload);
        toast.success("Campaign updated successfully!");
      } else {
        const response = await broadcastService.createBroadcast(payload);
        const newId = response.broadcast.id || response.broadcast._id; // ✅ Use `id` or fallback to `_id`
        toast.success("Campaign created successfully!");
        if (selectedStatus === 'running' && newId) {
          try {
            const sendResponse = await broadcastService.sendBroadcast(newId);
            toast.success(`Broadcast sent! Sent to ${sendResponse.sentCount || 0} users`);
          } catch (sendError) {
            toast.error("Campaign created but failed to send: " + sendError.message);
          }
        }
      }
      navigate("/admin/broadcast");
    } catch (error) {
      toast.error(error?.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ────────────────────────────────────
  const getChannelIcon = (channel) => {
    const found = channelOptions.find((c) => c.value === channel);
    return found?.icon || Mail;
  };

  const getAudienceLabel = (value) => {
    const found = audienceOptions.find((a) => a.value === value);
    return found?.label || value;
  };

  const getMessagePreview = () => {
    const audienceLabel = getAudienceLabel(formData.audience);
    const channelLabel = channelOptions.find((c) => c.value === selectedChannel)?.label || "";
    return {
      from: `Tumbler Studio via ${channelLabel}`,
      to: audienceLabel,
      subject: formData.subject || "(No subject)",
      message: formData.message || "Your message will appear here...",
    };
  };

  const preview = getMessagePreview();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const ChannelIcon = getChannelIcon(formData.channel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/broadcast"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isEditing ? "Edit Campaign" : "Create New Campaign"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isEditing
                ? `Editing "${formData.name}"`
                : "Create a new broadcast campaign"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && selectedStatus !== 'completed' && (
            <button
              type="button"
              onClick={handleSendNow}
              disabled={sending}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} /> Send Now
                </>
              )}
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => toast.success("Preview mode activated!")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Eye size={16} /> Preview
          </button>
        </div>
      </div>

      {/* ===== MAIN FORM ===== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── LEFT COLUMN ──────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Basic Information
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Summer Sale 2025"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Channel <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {channelOptions.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannel === channel.value;
                  return (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => handleChannelChange(channel.value)}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                        ${isSelected
                          ? `border-${channel.color}-500 bg-${channel.color}-50 dark:bg-${channel.color}-900/20 text-${channel.color}-600 dark:text-${channel.color}-400 shadow-sm`
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedChannel === "email" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Special Offer: Summer Sale!"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  required={selectedChannel === "email"}
                />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Message Content <span className="text-red-500">*</span>
            </h2>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              placeholder="Write your message here..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
              required
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{formData.message.length} characters</span>
              <span>Recommended: 150-200 characters</span>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Keep your message concise and include a clear call-to-action.
                  {selectedChannel === "email" && " Use personalization tokens like {first_name} for better engagement."}
                </span>
              </p>
            </div>
          </div>

          {/* Audience & Scheduling */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Audience & Scheduling
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAudience}
                  onChange={(e) => handleAudienceChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  {audienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count.toLocaleString()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  <Users size={12} className="inline mr-1" />
                  {formData.audienceCount.toLocaleString()} users will receive this broadcast
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Campaign Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((status) => {
                    const Icon = status.icon;
                    const isSelected = selectedStatus === status.value;
                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => handleStatusChange(status.value)}
                        className={`
                          flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-xs font-medium transition-all
                          ${isSelected
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedStatus === "scheduled" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    required={selectedStatus === "scheduled"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN ──────────────────────── */}
        <div className="space-y-6">
          {/* Thumbnail Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Thumbnail Image
            </h2>
            <div className="flex flex-col items-center gap-3">
              {formData.thumbnailImage ? (
                <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={formData.thumbnailImage}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square max-w-[200px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all gap-2 p-4"
                >
                  <Upload size={28} className="text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Upload Image</span>
                  <span className="text-xs text-gray-400">PNG, JPG, WEBP (max 5MB)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Campaign Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Eye size={16} className="text-gray-400" />
              Live Preview
            </h2>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                {formData.thumbnailImage ? (
                  <img
                    src={formData.thumbnailImage}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                    <ChannelIcon size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {formData.name || "Untitled Campaign"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {channelOptions.find((c) => c.value === selectedChannel)?.label || "Email"} •{" "}
                    {getAudienceLabel(selectedAudience)}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {selectedStatus === "scheduled" ? (
                    <span className="flex items-center gap-1 text-orange-500">
                      <Calendar size={12} /> Scheduled
                    </span>
                  ) : selectedStatus === "draft" ? (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Edit size={12} /> Draft
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-500">
                      <Send size={12} /> Ready
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {selectedChannel === "email" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Subject:</span> {preview.subject}
                  </div>
                )}
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {preview.message}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-400">
                <span>From: Tumbler Studio</span>
                <span>To: {preview.to}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {formData.message.length} characters
              </span>
              <span className={`font-medium ${formData.message.length > 160 ? "text-orange-500" : "text-green-500"}`}>
                {formData.message.length > 160 ? "⚠️ Long message" : "✅ Good length"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/admin/broadcast"
            className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? "Update Campaign" : "Create Campaign"}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BroadcastForm;