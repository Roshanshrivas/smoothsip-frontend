// src/pages/admin/Users.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Calendar,
  AlertCircle,
  Shield,
  Download,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import StatsGrid from "../../components/admin/StatsGrid";
import Pagination from "../../components/admin/Pagination";
import FilterBar from "../../components/admin/FilterBar";
import UserTable from "../../components/admin/users/UserTable";
import UserModal from "../../components/admin/users/UserModal";
import { userService } from "../../services/userService";

// ==============================================
// SKELETON COMPONENTS
// ==============================================
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="overflow-x-auto animate-pulse">
    <table className="w-full min-w-[800px]">
      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <tr>
          {["User", "Email", "Role", "Status", "Joined", "Orders", "Actions"].map((h) => (
            <th key={h} className="px-6 py-4 text-left">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
              </div>
            </td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /></td>
            <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
            <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
            <td className="px-6 py-4"><div className="flex gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" /><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==============================================
// MAIN COMPONENT
// ==============================================
const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    inactive: 0,
    newThisMonth: 0,
    admins: 0,
    customers: 0,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // "view" or "edit"

  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const itemsPerPage = 10;

  // ---------- Load Users ----------
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(res.users || []);
      setTotalPages(Math.ceil((res.total || 0) / itemsPerPage));
      setTotalItems(res.total || 0);
      setSelectedUsers([]);
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, search, roleFilter, statusFilter]);

  // ---------- Load Stats ----------
  const loadStats = useCallback(async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]);

  // ---------- Handlers ----------
  const handleSave = async (updates) => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, updates);
        toast.success("User updated successfully");
      } else {
        await userService.createUser(updates);
        toast.success("User created successfully");
      }
      setModalOpen(false);
      setSelectedUser(null);
      setModalMode("view");
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error(err.message || "Failed to save user");
    }
  };

  // Open modal in VIEW mode
  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setModalOpen(true);
  };

  // Open modal in EDIT mode
  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  // Open modal in CREATE mode (same as edit but with no user)
  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode("edit");
    setModalOpen(true);
  };

  // Switch from VIEW to EDIT mode (inside modal)
  const handleEditMode = () => {
    setModalMode("edit");
  };

  const handleDelete = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    if (user.role === "admin" && user.status === "Active") {
      toast.error("Cannot delete an active admin user.");
      return;
    }
    if (window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await userService.deleteUser(id);
        toast.success("User deleted");
        loadUsers();
        loadStats();
      } catch (err) {
        toast.error("Failed to delete user");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    const hasAdmin = users
      .filter((u) => selectedUsers.includes(u.id))
      .some((u) => u.role === "admin" && u.status === "Active");
    if (hasAdmin) {
      toast.error("Cannot delete active admin users.");
      return;
    }
    if (window.confirm(`Delete ${selectedUsers.length} selected users? This cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await userService.bulkDeleteUsers(selectedUsers);
        toast.success(`${selectedUsers.length} users deleted`);
        setSelectedUsers([]);
        loadUsers();
        loadStats();
      } catch (err) {
        toast.error("Failed to delete users");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allUsers = await userService.exportUsers({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      if (!allUsers.length) {
        toast.error("No users to export");
        return;
      }
      const headers = ["ID", "Name", "Email", "Role", "Status", "Joined", "Last Login", "Orders Count", "Total Spent"];
      const csvRows = [
        headers.join(","),
        ...allUsers.map((u) =>
          [
            u.id,
            `"${u.name}"`,
            u.email,
            u.role,
            u.status,
            u.joined,
            u.lastLogin || "Never",
            u.ordersCount || 0,
            u.totalSpent || 0,
          ].join(",")
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allUsers.length} users`);
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // ---------- NEW: Handlers for role and status updates from table ----------
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userService.updateUser(userId, { role: newRole });
      toast.success('Role updated successfully');
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await userService.updateUser(userId, { status: newStatus });
      toast.success('Status updated successfully');
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // ---------- Stats Cards ----------
  const statsCards = [
    {
      title: "Total Users",
      value: stats.total || 0,
      icon: UsersIcon,
      color: "blue",
      growth: "+12%",
    },
    {
      title: "Active Users",
      value: stats.active || 0,
      icon: UserCheck,
      color: "green",
      growth: "+8%",
    },
    {
      title: "Blocked Users",
      value: stats.blocked || 0,
      icon: UserX,
      color: "red",
      growth: "-3%",
    },
    {
      title: "New This Month",
      value: stats.newThisMonth || 0,
      icon: Calendar,
      color: "orange",
      growth: "+15%",
    },
    {
      title: "Admins",
      value: stats.admins || 0,
      icon: Shield,
      color: "purple",
      growth: "+2%",
    },
  ];

  // ---------- Filter Config ----------
  const filterConfigs = [
    {
      key: "role",
      label: "Role",
      icon: Shield,
      options: [
        { value: "all", label: "All Roles" },
        { value: "admin", label: "Admin", dot: "bg-purple-500" },
        { value: "customer", label: "Customer", dot: "bg-blue-500" },
      ],
      value: roleFilter,
      onChange: setRoleFilter,
    },
    {
      key: "status",
      label: "Status",
      icon: AlertCircle,
      options: [
        { value: "all", label: "All Status" },
        { value: "Active", label: "Active", dot: "bg-green-500" },
        { value: "Blocked", label: "Blocked", dot: "bg-red-500" },
        { value: "Inactive", label: "Inactive", dot: "bg-gray-400" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      <StatsGrid stats={statsCards} />

     <div className="relative z-30">
      <FilterBar
        title="Users"
        subtitle={`${totalItems} users`}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={filterConfigs}
        onClearFilters={clearFilters}
        addButton={{
          label: "Add User",
          onClick: handleCreate,
          icon: <Plus size={18} />,
        }}
        exportButton={{
          label: isExporting ? "Exporting..." : "Export",
          onClick: handleExport,
          icon: <Download size={16} />,
          loading: isExporting,
        }}
        isLoading={isInitialLoad}
      />
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && !loading && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 relative z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setSelectedUsers([])}
              className="text-sm text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm transition shadow-sm"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} /> Delete Selected
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-visible relative z-10">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <UserTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onUpdateRole={handleUpdateRole} 
              onUpdateStatus={handleUpdateStatus} 
              isLoading={loading}
              selectedUsers={selectedUsers}
              onSelectUser={(id) =>
                setSelectedUsers((prev) =>
                  prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                )
              }
              onSelectAll={(selectAll) =>
                setSelectedUsers(selectAll ? users.map((u) => u.id) : [])
              }
            />
            {users.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            )}
          </>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
          setModalMode("view");
        }}
        user={selectedUser}
        mode={modalMode}
        onSave={handleSave}
        onEditMode={handleEditMode}
      />
    </div>
  );
};

export default Users;