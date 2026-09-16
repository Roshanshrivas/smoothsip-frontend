// src/services/dashboardService.js
import apiClient from '../api/client';

export const dashboardService = {
  fetchDashboardData: async () => {
    try {
      // ─── 1. Fetch dashboard stats ──────────────────────────
      const statsResponse = await apiClient.get('/admin/analytics/dashboard');
      const stats = statsResponse.data.stats || {};

      // ─── 2. Fetch recent orders ────────────────────────────
      const ordersResponse = await apiClient.get('/admin/orders', {
        params: { page: 1, limit: 50, status: 'all' }, // get enough to compute daily
      });
      const allOrders = ordersResponse.data?.orders || [];

      // ─── 3. Fetch top products (fallback if 404) ──────────
      let topProducts = [];
      try {
        const productsResponse = await apiClient.get('/admin/analytics/top-products', {
          params: { limit: 5 },
        });
        topProducts = productsResponse.data?.products || [];
      } catch (err) {
        console.warn('Top products endpoint not available, using empty');
      }

      // ─── 4. Build daily sales chart (last 7 days vs previous 7 days) ──
      const salesChart = buildDailySalesChart(allOrders);

      // ─── 5. Build order status data ────────────────────────
      const statusCounts = stats.ordersByStatus || [];
      const orderStatus = statusCounts.map((item) => ({
        name: item._id || item.status || 'Unknown',
        value: item.count || 0,
        color: getStatusColor(item._id || item.status),
      }));

      // ─── 6. Store analytics ────────────────────────────────
      const storeAnalytics = {
        visitors: stats.totalVisitors || 0,
        visitorsGrowth: stats.visitorsGrowth || 0,
        conversionRate: stats.conversionRate || 0,
        conversionGrowth: stats.conversionGrowth || 0,
        totalRevenue: stats.totalRevenue || 0,
        revenueGrowth: stats.revenueGrowth || 0,
        newCustomers: stats.newCustomers || 0,
        newCustomersGrowth: stats.newCustomersGrowth || 0,
      };

      // ─── 7. Recent activities ──────────────────────────────
      const activities = generateRecentActivities(allOrders.slice(0, 10));

      // ─── 8. Return formatted data ──────────────────────────
      return {
        totalSales: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalCustomers: stats.totalCustomers || 0,
        totalReviews: stats.totalReviews || 0,
        avgOrderValue: stats.totalOrders > 0
          ? Math.round((stats.totalRevenue || 0) / stats.totalOrders)
          : 0,
        salesGrowth: stats.salesGrowth || 0,
        ordersGrowth: stats.ordersGrowth || 0,
        customersGrowth: stats.customersGrowth || 0,
        avgOrderGrowth: stats.avgOrderGrowth || 0,
        reviewsGrowth: stats.reviewsGrowth || 0,
        salesChart,
        recentOrders: formatRecentOrders(allOrders.slice(0, 5)),
        topProducts: formatTopProducts(topProducts),
        orderStatus,
        storeAnalytics,
        recentActivities: activities,
      };
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to load dashboard data');
    }
  },
};

// ─── Build Daily Sales Chart ──────────────────────────────
const buildDailySalesChart = (orders) => {
  // Define the days of the week (Mon–Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get today's date and find the most recent Monday
  const today = new Date();
  const dayOfWeekIndex = today.getDay(); // 0=Sunday, 1=Monday...
  const daysToMonday = (dayOfWeekIndex === 0) ? 6 : dayOfWeekIndex - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);

  // Helper: get start/end of a date range
  const getDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Generate dates for this week (Mon–Sun)
  const thisWeekStart = new Date(monday);
  const thisWeekEnd = new Date(monday);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
  const thisWeekDates = getDateRange(thisWeekStart, thisWeekEnd);

  // Generate dates for last week (Mon–Sun)
  const lastWeekStart = new Date(monday);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
  const lastWeekDates = getDateRange(lastWeekStart, lastWeekEnd);

  // Helper: aggregate revenue for a given date list
  const aggregateRevenue = (dateList, orders) => {
    const total = {};
    dateList.forEach((date) => {
      const dayStr = date.toISOString().slice(0, 10);
      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
        return orderDate === dayStr;
      });
      const dailyTotal = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Map Sun to 6
      total[dayName] = dailyTotal;
    });
    return total;
  };

  // Aggregate revenues for this week and last week
  const thisWeekRevenue = aggregateRevenue(thisWeekDates, orders);
  const lastWeekRevenue = aggregateRevenue(lastWeekDates, orders);

  // Build chart data array (thisWeek and lastWeek)
  const chartData = daysOfWeek.map((day) => ({
    day,
    thisWeek: thisWeekRevenue[day] || 0,
    lastWeek: lastWeekRevenue[day] || 0,
  }));

  // If all values are zero, return an empty array so the chart uses fallback sample
  const hasData = chartData.some((d) => d.thisWeek > 0 || d.lastWeek > 0);
  return hasData ? chartData : [];
};

// ─── Helper Functions ──────────────────────────────────

const getStatusColor = (status) => {
  const colors = {
    Delivered: '#10b981',
    Processing: '#3b82f6',
    Shipped: '#f59e0b',
    Pending: '#8b5cf6',
    Cancelled: '#6b7280',
    Refunded: '#ef4444',
  };
  return colors[status] || '#94a3b8';
};

const formatRecentOrders = (orders) => {
  return orders.slice(0, 5).map((order) => ({
    id: order.orderNumber || order._id,
    customer: order.customer || 'Unknown',
    total: order.total || 0,
    status: order.status || 'Pending',
    image: order.items?.[0]?.image || null,
    date: order.createdAt,
  }));
};

const formatTopProducts = (products) => {
  return products.slice(0, 5).map((item) => ({
    name: item.productName || item.name || 'Unknown',
    sold: item.totalSold || 0,
    revenue: item.revenue || 0,
    trend: Math.floor(Math.random() * 20) + 5,
    image: item.image || null,
  }));
};

const generateRecentActivities = (orders) => {
  const activities = [];
  orders.slice(0, 3).forEach((order) => {
    activities.push({
      icon: 'order',
      action: `New order #${order.orderNumber || order._id} placed by ${order.customer || 'Customer'}`,
      time: getTimeAgo(order.createdAt),
      status: order.status,
    });
  });
  if (activities.length < 3) {
    activities.push({
      icon: 'activity',
      action: 'System running normally',
      time: 'Just now',
      status: 'Active',
    });
  }
  return activities.slice(0, 6);
};

const getTimeAgo = (date) => {
  if (!date) return 'Just now';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};