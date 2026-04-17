export const API_BASE = 'http://localhost:8081/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const jsonHeaders = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
  ...extra
});
