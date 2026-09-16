// src/components/admin/categories/CategoryTable.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Trash } from "lucide-react";

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 12 } },
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    status === "Active" 
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  }`}>
    {status}
  </span>
);

const CategoryTable = ({ categories, onEdit, onDelete, onBulkDelete, onRowClick, isLoading }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected categories?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading categories...</div>;
  }
  if (!categories.length) {
    return <div className="p-8 text-center text-gray-500">No categories found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-4 py-4 text-left">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {categories.map((category) => (
            <motion.tr
              key={category.id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              onClick={() => onRowClick?.(category.id)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
            >
              <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(category.id)}
                  onChange={() => handleSelectOne(category.id)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {category.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{category.slug}</td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                <div className="line-clamp-1">{category.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{category.products}</td>
              <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={category.status} /></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.createdAt}</td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(category)} className="p-1 hover:text-orange-500 transition" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(category.id)} className="p-1 hover:text-red-500 transition" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      {selectedIds.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center gap-2"
          >
            <Trash size={14} /> Delete selected
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;