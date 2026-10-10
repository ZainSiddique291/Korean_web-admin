import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get Admin Dashboard Stats & KPIs
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const registeredUsers = await User.countDocuments({ role: 'customer' });

    // REVENUE CALCULATION:
    // Exclude Cancelled orders and exclude unpaid orders (only Paid or Delivered COD count as realized revenue)
    const realizedOrders = orders.filter((o) => {
      if (o.status === 'Cancelled') return false;
      return o.paymentStatus === 'Paid' || o.status === 'Delivered';
    });

    const totalRevenue = realizedOrders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
    const processingCount = orders.filter((o) => o.status === 'Processing').length;
    const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
    const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

    // Inventory metrics
    const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 10).length;
    const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) <= 0).length;

    // Unique customers from orders
    const customerEmails = new Set(
      orders.map((o) => o.customer?.email?.toLowerCase()).filter(Boolean)
    );
    const totalCustomers = Math.max(customerEmails.size, registeredUsers);

    res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalProducts,
        totalCustomers,
        totalStock,
        lowStockCount,
        outOfStockCount,
        deliveredCount,
        processingCount,
        shippedCount,
        cancelledCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregated Customers Directory for Admin
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getAdminCustomers = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const users = await User.find({ role: 'customer' });

    const map = new Map();

    // Group by customer email
    orders.forEach((ord) => {
      if (!ord.customer?.email) return;
      const key = ord.customer.email.toLowerCase();

      // Only count non-cancelled spend towards totalSpent
      const orderAmount = ord.status !== 'Cancelled' ? Number(ord.total || 0) : 0;

      if (!map.has(key)) {
        map.set(key, {
          name: ord.customer.name,
          email: ord.customer.email,
          phone: ord.customer.phone || 'N/A',
          city: ord.customer.city || 'N/A',
          orderCount: 1,
          totalSpent: orderAmount,
          latestOrderDate: ord.createdAt,
        });
      } else {
        const existing = map.get(key);
        existing.orderCount += 1;
        existing.totalSpent += orderAmount;
        if (new Date(ord.createdAt) > new Date(existing.latestOrderDate)) {
          existing.latestOrderDate = ord.createdAt;
        }
      }
    });

    // Add registered users who haven't ordered yet
    users.forEach((usr) => {
      const key = usr.email.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: usr.name,
          email: usr.email,
          phone: usr.phone || 'N/A',
          city: usr.city || 'Lahore',
          orderCount: 0,
          totalSpent: 0,
          latestOrderDate: usr.createdAt,
        });
      }
    });

    const customers = Array.from(map.values()).map((c) => ({
      ...c,
      totalSpent: Number(c.totalSpent.toFixed(2)),
    }));

    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
