import apiClient from '../api/client';
import toast from 'react-hot-toast';

export const analyticsService = {
  fetchAnalyticsData: async ({ dateRange = {}, revenueFilter = 'daily', ordersFilter = 'daily', topProductsFilter = 'weekly' } = {}) => {
    const params = new URLSearchParams({
      startDate: dateRange.start || '',
      endDate: dateRange.end || '',
      revenueFilter,
      ordersFilter,
      topProductsFilter,
    });
    const response = await apiClient.get(`/admin/analytics/full?${params}`);
    return response.data;
  },

  exportReport: async (format = 'csv', dateRange) => {
    const params = new URLSearchParams({ format, startDate: dateRange.start || '', endDate: dateRange.end || '' });
    const response = await apiClient.get(`/admin/analytics/export?${params}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
    return true;
  },
};