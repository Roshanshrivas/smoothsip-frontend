// src/utils/useAdminData.js

export const getDashboardStats = async () => ({
  totalProducts: 24,
  totalOrders: 156,
  totalRevenue: 187450,
  totalUsers: 1234,
  totalCustomDesigns: 89,
});

export const getRecentOrders = async () => [
  { id: "ORD1001", customerName: "Rajesh K.", total: 1299, status: "Delivered" },
  { id: "ORD1002", customerName: "Priya S.", total: 2498, status: "Processing" },
  { id: "ORD1003", customerName: "Amit V.", total: 1899, status: "Pending" },
  { id: "ORD1004", customerName: "Neha G.", total: 899, status: "Delivered" },
];

export const getRecentProducts = async () => [
  { id: 1, name: "Matte Black 24oz", price: 600, stock: 45 },
  { id: 2, name: "Royal Purple 24oz", price: 600, stock: 32 },
  { id: 3, name: "Sky Blue 24oz", price: 600, stock: 18 },
];

export const getSalesChartData = async () => [
  { date: "Mon", sales: 12000 },
  { date: "Tue", sales: 18000 },
  { date: "Wed", sales: 15000 },
  { date: "Thu", sales: 22000 },
  { date: "Fri", sales: 27000 },
  { date: "Sat", sales: 30000 },
  { date: "Sun", sales: 25000 },
];

export const getUserDistributionData = async () => [
  { name: "Active", value: 1100, color: "#10B981" },
  { name: "Blocked", value: 134, color: "#EF4444" },
];

// For Products page
export const getProducts = async () => [
  { id: 1, name: "Matte Black 24oz", price: 600, stock: 45, category: "Insulated" },
  { id: 2, name: "Royal Purple 24oz", price: 600, stock: 32, category: "Travel" },
  { id: 3, name: "Sky Blue 24oz", price: 600, stock: 18, category: "Coffee" },
];

// For Orders page
export const getAllOrders = async () => [
  { id: "ORD1001", customer: "Rajesh K.", total: 1299, status: "Delivered", items: 2, date: "2026-05-28" },
  { id: "ORD1002", customer: "Priya S.", total: 2498, status: "Processing", items: 3, date: "2026-05-29" },
  { id: "ORD1003", customer: "Amit V.", total: 1899, status: "Pending", items: 1, date: "2026-05-30" },
];

// For Users page
export const getAllUsers = async () => [
  { id: 1, name: "Rajesh K.", email: "rajesh@example.com", status: "Active", role: "user", joined: "2026-05-01" },
  { id: 2, name: "Priya S.", email: "priya@example.com", status: "Active", role: "user", joined: "2026-05-10" },
  { id: 3, name: "Admin User", email: "admin@tumbler.com", status: "Active", role: "admin", joined: "2026-04-01" },
];

// For Custom Designs page
export const getCustomDesigns = async () => {
  const stored = JSON.parse(localStorage.getItem("tumblerCart") || "[]");
  return stored.map((d, i) => ({
    id: d.id,
    tumblerName: d.product,
    customerName: d.customization?.text || "Anonymous",
    designImage: d.designImage,
    price: d.price,
    date: new Date(d.id).toLocaleDateString(),
  }));
};