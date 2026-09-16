import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  X,
  CheckCircle,
  Clock,
  Calendar,
  Eye,
  Layout,
  Grid,
  Sliders,
  Film,
} from "lucide-react";
import toast from "react-hot-toast";
import { bannerService } from "../../services/bannerService";
import StatsGrid from "../../components/admin/StatsGrid";
import Pagination from "../../components/admin/Pagination";
import FilterBar from "../../components/admin/FilterBar";
import BannerFormModal from "../../components/admin/Banners/BannerFormModal";
import DeleteConfirmModal from "../../components/admin/ConfirmDialog";
import apiClient from "../../api/client";


// ─── Section configuration (for sidebar) ──────────────
const SECTION_CONFIGS = [
  { key: "hero", label: "Hero", icon: Layout },
  { key: "features", label: "Features", icon: Grid },
  { key: "lifestyle", label: "Lifestyle", icon: Image },
  { key: "whychoose", label: "Why Choose", icon: Sliders },
  { key: "ugc", label: "UGC Gallery", icon: Film },
  // { key: "customize", label: "Customize", icon: Edit },
  // { key: "footer", label: "Footer", icon: Image },
];


const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    inactive: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [preselectedSection, setPreselectedSection] = useState(null);
  const itemsPerPage = 10;

  // ─── Load data ─────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bannersRes, statsRes] = await Promise.all([
        bannerService.fetchBanners({
          search,
          status: statusFilter,
          position: positionFilter,
          section: sectionFilter,
          page: currentPage,
          limit: itemsPerPage,
        }),
        bannerService.getStats(),
      ]);
      setBanners(bannersRes.banners || []);
      setTotalItems(bannersRes.total || 0);
      setTotalPages(bannersRes.totalPages || 1);
      setStats(
        statsRes || {
          total: 0,
          active: 0,
          scheduled: 0,
          expired: 0,
          inactive: 0,
        }
      );
    } catch (err) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, positionFilter, sectionFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── CRUD handlers ─────────────────────────────────
  const handleCreate = async (data) => {
    try {
      await bannerService.createBanner(data);
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to create");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await bannerService.updateBanner(editingBanner._id, data);
      setModalOpen(false);
      setEditingBanner(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };


  // Helper to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^.]+)?$/);
  if (match) {
    return match[1].replace(/\.[^.]+$/, '');
  }
  return null;
};

  const confirmDelete = async () => {
  if (!deleteTargetId) return;

  try {
    // 1. Find the banner in the current list
    const banner = banners.find((b) => b._id === deleteTargetId);
    if (banner && banner.section === 'ugc' && banner.content?.videos) {
      // Delete each video from Cloudinary
      for (const video of banner.content.videos) {
        if (video.url) {
          const publicId = extractPublicIdFromUrl(video.url);
          if (publicId) {
            try {
              await apiClient.post('/admin/cloudinary/delete-video', { publicId });
            } catch (err) {
              console.error('Failed to delete video from Cloudinary:', err);
              // Continue with other videos and banner deletion
            }
          }
        }
      }
    }

    // 2. Now delete the banner from database
    await bannerService.deleteBanner(deleteTargetId);
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    loadData();
    toast.success('Banner and associated videos deleted');
  } catch (err) {
    toast.error(err.message || "Failed to delete");
  }
};

  const handleToggleStatus = async (id) => {
    try {
      await bannerService.toggleStatus(id);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to toggle");
    }
  };

  const openEditModal = (id) => {
    const banner = banners.find((b) => b._id === id);
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPositionFilter("all");
    setSectionFilter("all");
    setCurrentPage(1);
  };

   const openCreateModal = (sectionKey = null) => {
    setPreselectedSection(sectionKey);
    setEditingBanner(null);
    setModalOpen(true);
  };

  // ─── Helpers ──────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (banner) => {
    const status = banner.status;
    const configs = {
      active: { color: "text-green-600", dot: "bg-green-500", label: "Active" },
      expired: { color: "text-red-600", dot: "bg-red-500", label: "Expired" },
      scheduled: { color: "text-blue-600", dot: "bg-blue-500", label: "Scheduled" },
      inactive: { color: "text-gray-600", dot: "bg-gray-500", label: "Inactive" },
    };
    return configs[status] || configs.inactive;
  };

  const statsCards = [
    { title: "Total Banners", value: stats.total, icon: Image, color: "orange" },
    { title: "Active", value: stats.active, icon: CheckCircle, color: "green" },
    { title: "Scheduled", value: stats.scheduled, icon: Clock, color: "blue" },
    { title: "Expired", value: stats.expired, icon: Calendar, color: "red" },
    { title: "Inactive", value: stats.inactive, icon: PowerOff, color: "gray" },
  ];

  // ─── Filter options ───────────────────────────────
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active", dot: "bg-green-500" },
    { value: "scheduled", label: "Scheduled", dot: "bg-blue-500" },
    { value: "expired", label: "Expired", dot: "bg-red-500" },
    { value: "inactive", label: "Inactive", dot: "bg-gray-500" },
  ];

  const positionOptions = [
    { value: "all", label: "All Positions" },
    { value: "home_top", label: "Home Top" },
    { value: "home_middle", label: "Home Middle" },
    { value: "home_bottom", label: "Home Bottom" },
    { value: "sidebar", label: "Sidebar" },
  ];

  // ─── Render ──────────────────────────────────────
  return (
    <div className="space-y-6">
      <StatsGrid stats={statsCards} />

      <div className="flex gap-6">
        {/* ─── Left Sidebar ────────────────────────── */}
        <div className="w-56 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 h-fit sticky top-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Sections
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => setSectionFilter("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                sectionFilter === "all"
                  ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All Sections
            </button>
            {SECTION_CONFIGS.map((section) => {
              const Icon = section.icon;
              const isActive = sectionFilter === section.key;
              // Count banners for this section (computed from the loaded banners)
              const count = banners.filter((b) => b.section === section.key).length;
              return (
                <button
                  key={section.key}
                  onClick={() => setSectionFilter(section.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                    isActive
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} />
                    {section.label}
                  </span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ─── Right Content ─────────────────────────── */}
        <div className="flex-1 min-w-0">
          <FilterBar
            title="Banners"
            subtitle="Manage your promotional banners"
            searchTerm={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search banners..."
            filters={[
              {
                key: "status",
                label: "Status",
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter,
              },
              {
                key: "position",
                label: "Position",
                options: positionOptions,
                value: positionFilter,
                onChange: setPositionFilter,
              },
            ]}
            onClearFilters={clearFilters}
            addButton={{
              label: "Create Banner",
              onClick: () => {
                setEditingBanner(null);
                setModalOpen(true);
              },
              icon: <Plus size={18} />,
            }}
            containerClassName="mb-0"
            isLoading={loading}
          />

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mt-4">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No banners found. Create your first banner!
                </div>
              ) : (
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-3 text-left w-[12%]">Banner</th>
                      <th className="px-3 py-3 text-left w-[14%]">Title</th>
                      <th className="px-3 py-3 text-left w-[10%]">Section</th>
                      <th className="px-3 py-3 text-left w-[10%]">Position</th>
                      <th className="px-3 py-3 text-left w-[18%]">Validity</th>
                      <th className="px-3 py-3 text-left w-[10%]">Status</th>
                      <th className="px-3 py-3 text-center w-[8%]">Priority</th>
                      <th className="px-3 py-3 text-center w-[18%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {banners.map((banner) => {
                      const statusConfig = getStatusConfig(banner);
                      const startDate = formatDate(banner.startDate);
                      const endDate = formatDate(banner.endDate);
                      const validity =
                        startDate && endDate ? `${startDate} → ${endDate}` : "—";
                      return (
                        <tr
                          key={banner._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                        >
                          <td className="px-3 py-3">
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="w-16 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-800 dark:text-white">
                            {banner.title}
                          </td>
                          <td className="px-3 py-3 capitalize text-xs">
                            {banner.section || "—"}
                          </td>
                          <td className="px-3 py-3 capitalize text-xs">
                            {banner.position?.replace("_", " ") || "—"}
                          </td>
                          <td className="px-3 py-3 text-xs whitespace-nowrap">
                            {validity}
                          </td>
                          <td className="px-3 py-3">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                              ></span>
                              <span className={statusConfig.color}>
                                {statusConfig.label}
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {banner.order || "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedBanner(banner);
                                  setDetailModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => openEditModal(banner._id)}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(banner._id)}
                                className={`p-1 rounded hover:bg-gray-100 ${
                                  banner.isActive
                                    ? "text-gray-400 hover:text-orange-500"
                                    : "text-gray-400 hover:text-green-500"
                                }`}
                                title={banner.isActive ? "Deactivate" : "Activate"}
                              >
                                {banner.isActive ? (
                                  <PowerOff size={15} />
                                ) : (
                                  <Power size={15} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(banner._id)}
                                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-2 text-sm text-gray-500">
                <span>
                  Showing {banners.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  simple
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────── */}
      <BannerFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBanner(null);
        }}
        onSave={editingBanner ? handleUpdate : handleCreate}
        initialData={editingBanner}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
      />

      {detailModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Banner Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <img
                src={selectedBanner.image}
                alt={selectedBanner.title}
                className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-200"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Title:</span> {selectedBanner.title}
                </div>
                <div>
                  <span className="font-medium">Subtitle:</span>{" "}
                  {selectedBanner.subtitle || "—"}
                </div>
                <div>
                  <span className="font-medium">Section:</span> {selectedBanner.section}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {selectedBanner.position}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Link:</span>{" "}
                  <a
                    href={selectedBanner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {selectedBanner.link}
                  </a>
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {selectedBanner.order || "—"}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Validity:</span>{" "}
                  {formatDate(selectedBanner.startDate)} →{" "}
                  {formatDate(selectedBanner.endDate)}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${getStatusConfig(selectedBanner).color}`}
                  >
                    {getStatusConfig(selectedBanner).label}
                  </span>
                </div>
                {selectedBanner.mediaType === "video" && (
                  <div>
                    <span className="font-medium">Media:</span> Video
                  </div>
                )}
                {selectedBanner.content && (
                  <div className="col-span-2">
                    <span className="font-medium">Content:</span>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-32">
                      {JSON.stringify(selectedBanner.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  openEditModal(selectedBanner._id);
                }}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Edit Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;