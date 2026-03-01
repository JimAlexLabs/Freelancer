// api.js — AfriGig Frontend API Client
// Drop this file into your frontend project (same folder as afrigig-v3.jsx)
// Vite: configure backend URL via VITE_API_URL in .env

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "http://localhost:4000/api/v1";

// ── Token management ────────────────────────────────────────
let _accessToken = null;

function getToken()        { return _accessToken || localStorage.getItem('ag3_access_token'); }
function setToken(t)       { _accessToken = t; if (t) localStorage.setItem('ag3_access_token', t); }
function clearToken()      { _accessToken = null; localStorage.removeItem('ag3_access_token'); localStorage.removeItem('ag3_token'); }

// ── Core fetch wrapper ───────────────────────────────────────
async function api(method, path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',     // send/receive httpOnly refresh token cookie
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401) {
    const data = await res.clone().json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${getToken()}`;
        const retry = await fetch(`${BASE}${path}`, {
          method,
          headers,
          credentials: 'include',
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!retry.ok) {
          const errData = await retry.json().catch(() => ({}));
          throw new ApiError(errData.error || 'Request failed', retry.status);
        }
        return retry.json();
      } else {
        // Refresh failed — log out
        clearToken();
        window.location.hash = '/login';
        throw new ApiError('Session expired. Please log in again.', 401);
      }
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(errData.error || `HTTP ${res.status}`, res.status);
  }

  return res.status === 204 ? null : res.json();
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function refreshAccessToken() {
  try {
    const data = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    }).then(r => r.ok ? r.json() : null);
    if (data?.access_token) {
      setToken(data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Auth ─────────────────────────────────────────────────────
export const Auth = {
  async register(name, email, password) {
    return api('POST', '/auth/register', { name, email, password });
  },

  async login(email, password) {
    const data = await api('POST', '/auth/login', { email, password });
    if (data?.access_token) setToken(data.access_token);
    return data;
  },

  async logout() {
    try { await api('POST', '/auth/logout'); } catch {}
    clearToken();
  },

  async logoutAll() {
    await api('POST', '/auth/logout-all');
    clearToken();
  },

  async me() {
    return api('GET', '/auth/me');
  },

  async verifyEmail(token) {
    return api('GET', `/auth/verify-email?token=${token}`);
  },

  async resendVerification(email) {
    return api('POST', '/auth/resend-verification', { email });
  },

  async forgotPassword(email) {
    return api('POST', '/auth/forgot-password', { email });
  },

  async resetPassword(token, password) {
    return api('POST', '/auth/reset-password', { token, password });
  },

  async changePassword(current_password, new_password) {
    return api('POST', '/auth/change-password', { current_password, new_password });
  },
};

// ── Users / Profile ──────────────────────────────────────────
export const Users = {
  async getProfile(id) {
    return api('GET', `/users/profile/${id}`);
  },
  async updateProfile(data) {
    return api('PATCH', '/users/profile', data);
  },
  async setTrack(track) {
    return api('PATCH', '/users/profile/track', { track });
  },
};

// ── Jobs ─────────────────────────────────────────────────────
export const Jobs = {
  async list(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return api('GET', `/jobs${qs ? '?' + qs : ''}`);
  },
  async get(id) {
    return api('GET', `/jobs/${id}`);
  },
  async create(data) {
    return api('POST', '/jobs', data);
  },
  async update(id, data) {
    return api('PATCH', `/jobs/${id}`, data);
  },
};

// ── Applications ─────────────────────────────────────────────
export const Applications = {
  async apply(jobId, data) {
    return api('POST', `/jobs/${jobId}/applications`, data);
  },
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api('GET', `/applications${qs ? '?' + qs : ''}`);
  },
  async updateStatus(id, status) {
    return api('PATCH', `/applications/${id}`, { status });
  },
};

// ── Messages ─────────────────────────────────────────────────
export const Messages = {
  async listConversations() {
    return api('GET', '/messages/conversations');
  },
  async startConversation(recipient_id, message) {
    return api('POST', '/messages/conversations', { recipient_id, message });
  },
  async getMessages(convoId, page = 1) {
    return api('GET', `/messages/conversations/${convoId}?page=${page}`);
  },
  async send(convoId, body) {
    return api('POST', `/messages/conversations/${convoId}/messages`, { body });
  },
};

// ── Tickets ──────────────────────────────────────────────────
export const Tickets = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api('GET', `/tickets${qs ? '?' + qs : ''}`);
  },
  async create(subject, message, priority = 'medium') {
    return api('POST', '/tickets', { subject, message, priority });
  },
  async get(id) {
    return api('GET', `/tickets/${id}`);
  },
  async reply(id, body) {
    return api('POST', `/tickets/${id}/replies`, { body });
  },
  async updateStatus(id, status) {
    return api('PATCH', `/tickets/${id}/status`, { status });
  },
};

// ── Payments ─────────────────────────────────────────────────
export const Payments = {
  async depositEscrow(job_id, amount, method = 'mpesa', phone) {
    return api('POST', '/payments/escrow/deposit', { job_id, amount, method, phone });
  },
  async releaseEscrow(escrowId) {
    return api('POST', `/payments/escrow/${escrowId}/release`);
  },
  async getWallet() {
    return api('GET', '/payments/wallet');
  },
  async listTransactions() {
    return api('GET', '/payments/transactions');
  },
};

// ── Notifications ────────────────────────────────────────────
export const Notifications = {
  async list(unreadOnly = false) {
    return api('GET', `/notifications${unreadOnly ? '?unread_only=true' : ''}`);
  },
  async markRead(id) {
    return api('PATCH', `/notifications/${id}/read`);
  },
  async markAllRead() {
    return api('PATCH', '/notifications/read-all');
  },
};

// ── Admin ────────────────────────────────────────────────────
export const Admin = {
  async getStats() {
    return api('GET', '/admin/stats');
  },
  async listUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api('GET', `/admin/users${qs ? '?' + qs : ''}`);
  },
  async updateUserStatus(id, action, reason) {
    return api('PATCH', `/admin/users/${id}/status`, { action, reason });
  },
  async getReviewQueue() {
    return api('GET', '/admin/reviews');
  },
  async getAuditLog(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api('GET', `/admin/audit-log${qs ? '?' + qs : ''}`);
  },
  async getEmailLog() {
    return api('GET', '/admin/email-log');
  },
};

export { ApiError, getToken, setToken, clearToken };
export default { Auth, Users, Jobs, Applications, Messages, Tickets, Payments, Notifications, Admin };
