// src/components/admin/users/UserTable.jsx
import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, RefreshCw, Users } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 12 } },
};

// Role dropdown colours – note: role values are "user" and "admin"
const roleColors = {
  admin: "bg-purple-50 text-purple-600 border-purple-200",
  user: "bg-blue-50 text-blue-600 border-blue-200", // changed from "customer"
};

const statusColors = {
  Active: "bg-green-50 text-green-600 border-green-200",
  Blocked: "bg-red-50 text-red-600 border-red-200",
};

const UserTable = memo(({
  users,
  onEdit,
  onDelete,
  onView,
  onUpdateRole,
  onUpdateStatus,
  isLoading,
  selectedUsers,
  onSelectUser,
  onSelectAll,
}) => {
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null });
  const allSelected = users.length > 0 && selectedUsers.length === users.length;

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    if (onUpdateRole) await onUpdateRole(userId, newRole);
    setUpdatingId(null);
  };

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    if (onUpdateStatus) await onUpdateStatus(userId, newStatus);
    setUpdatingId(null);
  };

  const openDeleteDialog = (userId) => {
    setDeleteDialog({ isOpen: true, userId });
  };

  const confirmDelete = async () => {
    const { userId } = deleteDialog;
    if (userId) {
      await onDelete(userId);
    }
    setDeleteDialog({ isOpen: false, userId: null });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, userId: null });
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {[...Array(9)].map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="p-12 text-center text-gray-500">
        <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p>No users found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-[1000px] w-full table-auto">

              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-0">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {users.map((user) => {
                  const isUpdating = updatingId === user.id;
                  return (
                    <motion.tr
                      key={user.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => onView(user)}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => onSelectUser(user.id)}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff6b00&color=fff`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.phone || "—"}
                      </td>
                      
                      {/* Role dropdown – options now "user" and "admin" */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={user.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`
                              pl-2 pr-6 py-1 rounded-md border text-xs font-medium cursor-pointer outline-none bg-white
                              ${roleColors[user.role] || "bg-gray-50 text-gray-600 border-gray-200"}
                              ${isUpdating ? "opacity-50 cursor-wait" : ""}
                            `}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          {isUpdating && (
                            <RefreshCw size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                          )}
                        </div>
                      </td>
                      
                      {/* Status dropdown */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={user.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className={`
                              pl-2 pr-6 py-1 rounded-md border text-xs font-medium cursor-pointer outline-none bg-white
                              ${statusColors[user.status] || "bg-gray-50 text-gray-600 border-gray-200"}
                              ${isUpdating ? "opacity-50 cursor-wait" : ""}
                            `}
                          >
                            <option value="Active">Active</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                          {isUpdating && (
                            <RefreshCw size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.joined}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                        {user.ordersCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(user)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition"
                            title="Edit user"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(user.id)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </>
  );
});

UserTable.displayName = "UserTable";

export default UserTable;