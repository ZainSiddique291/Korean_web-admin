import axios from 'axios';

// Resolve dynamic API URL:
// 1. In browser when accessed via LAN IP/hostname on other devices:
//    If VITE_API_BASE_URL is not set or points to localhost, route via '/api' through Vite's dev proxy,
//    ensuring mobile phones and other devices on Wi-Fi connect seamlessly without Network Errors.
// 2. In production or when VITE_API_BASE_URL is an explicit public URL (not localhost), use it directly.
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // In browser on other devices (non-localhost hostname):
  if (typeof window !== 'undefined' && window.location) {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!isLocalhost && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return '/api';
    }
  }

  if (!envUrl) return '/api';
  const cleaned = envUrl.replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

const baseURL = getBaseURL();

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const TOKEN_KEYS = {
  ACCESS: 'k_admin_access_token',
  REFRESH: 'k_admin_refresh_token',
  USER: 'k_admin_user',
};

export const getStoredAccessToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS);
export const getStoredRefreshToken = () => localStorage.getItem(TOKEN_KEYS.REFRESH);

export const setStoredTokens = ({ accessToken, refreshToken, user }) => {
  if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  if (user) localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
};

api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = getStoredRefreshToken();
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        if (refreshRes.data.success && refreshRes.data.accessToken) {
          const newAccessToken = refreshRes.data.accessToken;
          localStorage.setItem(TOKEN_KEYS.ACCESS, newAccessToken);
          if (refreshRes.data.user) {
            localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(refreshRes.data.user));
          }

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearStoredAuth();
        window.dispatchEvent(new Event('admin:session_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success) {
      setStoredTokens({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        user: res.data.user,
      });
    }
    return res.data;
  },

  logout: async () => {
    try {
      const storedRefreshToken = getStoredRefreshToken();
      await api.post('/auth/logout', { refreshToken: storedRefreshToken });
    } finally {
      clearStoredAuth();
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success && res.data.user) {
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(res.data.user));
    }
    return res.data;
  },
};

export const productService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id, fields) => {
    const res = await api.put(`/products/${id}`, fields);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export const orderService = {
  getAllOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  updateOrderStatus: async (id, statusData) => {
    const res = await api.put(`/orders/${id}/status`, statusData);
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getCustomers: async () => {
    const res = await api.get('/admin/customers');
    return res.data;
  },
};

export const contactService = {
  getInquiries: async () => {
    const res = await api.get('/contact');
    return res.data;
  },
};

export default api;
