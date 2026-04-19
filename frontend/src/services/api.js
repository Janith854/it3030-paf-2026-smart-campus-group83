// Central API service — all backend calls go through Vite proxy (/api/* → localhost:8081)

const BASE = '/api/v1';

function authHeaders() {
  const token = localStorage.getItem('token');
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function req(method, path, body = null) {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type');
  return ct && ct.includes('application/json') ? res.json() : res.text();
}

// Multipart (for ticket images)
async function reqMultipart(path, formData) {
  const token = localStorage.getItem('token');
  const h = {};
  if (token) h.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: h, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

// ── Test ──────────────────────────────────────────────────────────────────────
export const testApi = {
  ping: () => req('GET', '/test/public/test'),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  loginWithGoogle: (googleToken) => req('POST', '/auth/google', { googleToken }),
  getCurrentUser: () => req('GET', '/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => req('GET', '/users'),
  getByRole: (role) => req('GET', `/users/role/${role}`),
  getTechnicians: () => req('GET', '/users/technicians'),
  updateRole: (userId, role) => req('PATCH', `/users/${userId}/role?role=${role}`),
  delete: (userId) => req('DELETE', `/users/${userId}`),
};

// ── Resources ─────────────────────────────────────────────────────────────────
export const resourcesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.minCapacity) qs.set('minCapacity', params.minCapacity);
    if (params.location) qs.set('location', params.location);
    if (params.status) qs.set('status', params.status);
    const q = qs.toString();
    return req('GET', `/resources${q ? '?' + q : ''}`);
  },
  getById: (id) => req('GET', `/resources/${id}`),
  create: (resource) => req('POST', '/resources', resource),
  update: (id, resource) => req('PUT', `/resources/${id}`, resource),
  updateStatus: (id, status) => req('PATCH', `/resources/${id}/status?status=${status}`),
  delete: (id) => req('DELETE', `/resources/${id}`),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (booking) => req('POST', '/bookings', booking),
  getMy: () => req('GET', '/bookings/my'),
  getAll: (status) => req('GET', status ? `/bookings?status=${status}` : '/bookings'),
  getById: (id) => req('GET', `/bookings/${id}`),
  approve: (id) => req('PATCH', `/bookings/${id}/approve`),
  reject: (id, reason) => req('PATCH', `/bookings/${id}/reject?reason=${encodeURIComponent(reason)}`),
  cancel: (id) => req('PATCH', `/bookings/${id}/cancel`),
  delete: (id) => req('DELETE', `/bookings/${id}`),
};

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketsApi = {
  create: (ticketData, images) => {
    const fd = new FormData();
    fd.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }));
    if (images) images.forEach((img) => fd.append('images', img));
    return reqMultipart('/tickets', fd);
  },
  getMy: () => req('GET', '/tickets/my'),
  getAll: (status, priority) => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (priority) qs.set('priority', priority);
    const q = qs.toString();
    return req('GET', `/tickets${q ? '?' + q : ''}`);
  },
  getById: (id) => req('GET', `/tickets/${id}`),
  updateStatus: (id, status, notes) => {
    const qs = new URLSearchParams({ status });
    if (notes) qs.set('notes', notes);
    return req('PATCH', `/tickets/${id}/status?${qs}`);
  },
  assign: (id, technicianId) => req('PATCH', `/tickets/${id}/assign?technicianId=${technicianId}`),
  addComment: (id, content) => req('POST', `/tickets/${id}/comments?content=${encodeURIComponent(content)}`),
  deleteComment: (ticketId, commentId) => req('DELETE', `/tickets/${ticketId}/comments/${commentId}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => req('GET', '/notifications'),
  getUnreadCount: () => req('GET', '/notifications/unread-count'),
  markAsRead: (id) => req('PATCH', `/notifications/${id}/read`),
  markAllAsRead: () => req('PATCH', '/notifications/read-all'),
  delete: (id) => req('DELETE', `/notifications/${id}`),
};
