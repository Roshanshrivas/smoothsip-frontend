// src/pages/admin/CategoryDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Tag,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Image,
  FolderTree,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../ConfirmDialog";
import { categoryService } from "../../../services/categoryService";

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await categoryService.getCategory(id);
        setCategory(data);
      } catch (err) {
        setError("Category not found");
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [id]);

  const handleDelete = async () => {
    await categoryService.deleteCategory(id);
    setDeleteModalOpen(false);
    toast.success("Category deleted");
    navigate("/admin/categories");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center py-12">
        <FolderTree size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Category not found</h2>
        <Link to="/admin/categories" className="text-orange-500 hover:underline mt-2 inline-block">
          Back to Categories
        </Link>
      </div>
    );
  }

  const StatusIcon = category.status === "Active" ? CheckCircle : XCircle;
  const StatusColor = category.status === "Active" ? "text-green-500" : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/categories" className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Categories
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{category.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{category.name}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
              category.status === "Active" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              <StatusIcon size={14} />
              {category.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1 flex-wrap">
            <span>Slug: {category.slug}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Category ID: #{category.id}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
          <Link
            to={`/admin/categories/${id}/edit`}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Edit size={16} /> Edit Category
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-64 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-full h-64 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FolderTree size={64} className="text-gray-300" />
              </div>
            )}
            <div className="mt-3 text-center text-sm text-gray-500">
              <Image size={16} className="inline mr-1" /> Category image
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center shadow-sm">
              <p className="text-xs text-gray-500">Products</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{category.products || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center shadow-sm">
              <p className="text-xs text-gray-500">Status</p>
              <p className={`text-lg font-bold ${StatusColor}`}>{category.status}</p>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <Info size={16} /> Category Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{category.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Slug</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{category.slug}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Products</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{category.products || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>

          {category.description && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <Tag size={16} /> Description
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{category.description}</p>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default CategoryDetail;