const getAuthHeaders = () => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  let userToken = token;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userToken = user.token || token;
    } catch (e) {}
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  };
};

export const analyticsService = {
  getTopResources: async (period) => {
    const query = period ? `?period=${period}` : '';
    const res = await fetch(`/api/v1/analytics/top-resources${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch top resources");
    return res.json();
  },
  getPeakHours: async (period) => {
    const query = period ? `?period=${period}` : '';
    const res = await fetch(`/api/v1/analytics/peak-hours${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch peak hours");
    return res.json();
  }
};
