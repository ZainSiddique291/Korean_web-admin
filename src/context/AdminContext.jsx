import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authService,
  productService,
  orderService,
  adminService,
  getStoredAccessToken,
  clearStoredAuth,
} from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

export const AdminProvider = ({ children }) => {
  // Authentication
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('k_admin_user')) || null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Core Data
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Loading & Sync states
  const [dataLoading, setDataLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Check auth session on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredAccessToken();
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user && res.user.role === 'admin') {
            setAdminUser(res.user);
            localStorage.setItem('k_admin_user', JSON.stringify(res.user));
          } else {
            clearStoredAuth();
            setAdminUser(null);
          }
        } catch {
          clearStoredAuth();
          setAdminUser(null);
        }
      }
      setAuthLoading(false);
    };

    checkAuth();

    const handleExpired = () => {
      setAdminUser(null);
      clearStoredAuth();
      showToast('Admin session expired. Please sign in again.');
    };

    window.addEventListener('admin:session_expired', handleExpired);
    return () => window.removeEventListener('admin:session_expired', handleExpired);
  }, [showToast]);

  // Fetch all admin data (Stats, Products, Orders, Customers)
  const refreshAllData = useCallback(async () => {
    if (!adminUser) return;
    setIsSyncing(true);
    try {
      const [statsRes, productsRes, ordersRes, customersRes] = await Promise.allSettled([
        adminService.getStats(),
        productService.getProducts({ limit: 100 }),
        orderService.getAllOrders(),
        adminService.getCustomers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.stats);
      }
      if (productsRes.status === 'fulfilled' && productsRes.value?.success) {
        setProducts(productsRes.value.products || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        setOrders(ordersRes.value.orders || []);
      }
      if (customersRes.status === 'fulfilled' && customersRes.value?.success) {
        setCustomers(customersRes.value.customers || []);
      }
      showToast('Admin dashboard synced with live MongoDB Atlas ⚡');
    } catch {
      showToast('Failed to sync with MongoDB Atlas');
    } finally {
      setIsSyncing(false);
    }
  }, [adminUser, showToast]);

  // Trigger initial fetch when adminUser logs in
  useEffect(() => {
    if (adminUser) {
      setDataLoading(true);
      refreshAllData().finally(() => setDataLoading(false));
    }
  }, [adminUser, refreshAllData]);

  // Auth actions
  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.user) {
        if (res.user.role !== 'admin') {
          clearStoredAuth();
          throw new Error('Access denied. Administrator privileges required.');
        }
        setAdminUser(res.user);
        showToast(`Welcome back, ${res.user.name}! Connected to Atlas ✅`);
        return res.user;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      showToast(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    }
    setAdminUser(null);
    setStats(null);
    setProducts([]);
    setOrders([]);
    setCustomers([]);
    showToast('Logged out of Admin Portal');
  };

  // Products CRUD
  const addProduct = async (productData) => {
    try {
      const res = await productService.createProduct(productData);
      if (res.success && res.product) {
        setProducts((prev) => [res.product, ...prev]);
        setStats((prev) => prev ? { ...prev, totalProducts: (prev.totalProducts || 0) + 1 } : null);
        showToast('Product successfully saved to MongoDB Atlas! ✅');
        return res.product;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id, fields) => {
    try {
      const res = await productService.updateProduct(id, fields);
      if (res.success && res.product) {
        setProducts((prev) => prev.map((p) => ((p._id === id || p.id === id) ? res.product : p)));
        showToast('Product updated in MongoDB Atlas! ✅');
        return res.product;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      setStats((prev) => prev ? { ...prev, totalProducts: Math.max(0, (prev.totalProducts || 0) - 1) } : null);
      showToast('Product deleted from MongoDB Atlas');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product');
      throw err;
    }
  };

  // Orders Actions
  const updateOrderStatus = async (id, status) => {
    try {
      const payload = typeof status === 'string' ? { status } : status;
      const res = await orderService.updateOrderStatus(id, payload);
      if (res.success && res.order) {
        setOrders((prev) => prev.map((o) => ((o._id === id || o.id === id) ? res.order : o)));
        adminService.getStats().then((sRes) => {
          if (sRes?.success) setStats(sRes.stats);
        }).catch(() => {});
        showToast(`Order status updated to "${payload.status || payload}" ✅`);
        return res.order;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status');
      throw err;
    }
  };

  const value = {
    adminUser,
    authLoading,
    stats,
    products,
    orders,
    customers,
    dataLoading,
    isSyncing,
    toast,
    login,
    logout,
    refreshAllData,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    showToast,
    hideToast,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
