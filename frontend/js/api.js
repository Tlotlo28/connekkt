// ===========================
// CONNEKKT API CLIENT
// One module. Every fetch call to the backend goes through here.
// ===========================

const API_BASE = 'http://localhost:8000';

// We'll store the JWT in localStorage. Survives page refresh, browser close, etc.
// (For production-grade security, httpOnly cookies are stronger — but for a portfolio
// project, localStorage + JWT is industry-common and fine.)
const TOKEN_KEY = 'connekkt_token';
const USER_KEY = 'connekkt_user';

const auth = {
  getToken() { return localStorage.getItem(TOKEN_KEY); },
  setToken(t) { localStorage.setItem(TOKEN_KEY, t); },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getCachedUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setCachedUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  isLoggedIn() { return !!this.getToken(); }
};

// The core fetch wrapper. Every API call goes through this.
async function request(path, { method = 'GET', body = null, requireAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  // Attach JWT if we have one
  const token = auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (err) {
    // Network error: backend is down, no internet, etc.
    throw new ApiError('Could not reach Connekkt. Is the server running?', 0);
  }

  // 401 = your token is invalid or expired. Kick the user out.
  if (response.status === 401 && requireAuth) {
    auth.clear();
    window.location.href = 'index.html';
    throw new ApiError('Session expired.', 401);
  }

  // Try to parse the JSON body. Some responses (like 204) have no body.
  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { /* ignore — non-JSON response */ }
  }

  if (!response.ok) {
    const detail = data?.detail || `Request failed (${response.status})`;
    throw new ApiError(detail, response.status);
  }

  return data;
}

// Custom error class so callers can check status codes
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ===========================
// PUBLIC API
// What every other JS file imports.
// ===========================
const api = {
  // --- Auth ---
  async signup({ email, password, name }) {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: { email, password, name }
    });
    auth.setToken(data.access_token);
    auth.setCachedUser(data.user);
    return data.user;
  },

  async login({ email, password }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    auth.setToken(data.access_token);
    auth.setCachedUser(data.user);
    return data.user;
  },
    async demoLogin() {
        const data = await request('/auth/demo', { method: 'POST' });
        auth.setToken(data.access_token);
        auth.setCachedUser(data.user);
        return data.user;
    },

  logout() {
    auth.clear();
    window.location.href = 'index.html';
  },

  // --- Profile ---
  async getMe() {
    const user = await request('/users/me', { requireAuth: true });
    auth.setCachedUser(user);
    return user;
  },

  async updateMe(updates) {
    const user = await request('/users/me', {
      method: 'PATCH',
      body: updates,
      requireAuth: true
    });
    auth.setCachedUser(user);
    return user;
  },

  // --- Discovery ---
  async listUsers({ category = null, lat = null, lng = null, radiusKm = 50, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (lat !== null && lng !== null) {
      params.set('lat', lat);
      params.set('lng', lng);
      params.set('radius_km', radiusKm);
    }
    params.set('limit', limit);
    return await request(`/users?${params.toString()}`, { requireAuth: true });
  },

  async getUser(id) {
    return await request(`/users/${id}`, { requireAuth: true });
  },

  async updateMyLocation({ lat, lng }) {
    const user = await request('/users/me/location', {
      method: 'PATCH',
      body: { lat, lng },
      requireAuth: true
    });
    auth.setCachedUser(user);
    return user;
  },
  // --- Helpers ---
  isLoggedIn() { return auth.isLoggedIn(); },
  getCachedUser() { return auth.getCachedUser(); },
};