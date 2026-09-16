import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { Menu } from "lucide-react";
import PageTracker from "../../components/PageTracker";

const AdminLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Apply dark mode to <html> (already handled inside Header? Move it here for consistency)
  React.useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PageTracker />
      {/* Mobile header with menu button */}
      <div className="lg:hidden bg-white dark:bg-gray-900 shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setMobileSidebarOpen(true)} className="text-gray-600 dark:text-gray-400">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-orange-600">Tumbler<span className="text-gray-800 dark:text-white">Admin</span></h1>
        <div className="w-6" />
      </div>

      {/* Mobile sidebar overlay & drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar isMobile onMobileClose={() => setMobileSidebarOpen(false)} isExpanded={false} />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      />

      {/* Main content */}
      <main className="min-h-screen transition-all duration-300" style={{ marginLeft: "72px" }}>
        <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;