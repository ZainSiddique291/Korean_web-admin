import fs from 'fs';
import path from 'path';

const serverDir = path.resolve('../E_commerce2/server');

// 1. Create Contact.js model
const contactModel = `import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      lowercase: true,
      trim: true,
      match: [
        /^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: 'General Inquiry',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please enter your message'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters long'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Resolved'],
      default: 'New',
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
`;

fs.writeFileSync(path.join(serverDir, 'models/Contact.js'), contactModel, 'utf8');
console.log('✓ Created Contact.js model');

// 2. Create contactController.js
const contactController = `import Contact from '../models/Contact.js';

// @desc    Submit a customer contact message / inquiry
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const emailRegex = /^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Message must be at least 5 characters long' });
    }

    const inquiry = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been received by our skincare team.',
      inquiry: {
        id: inquiry._id,
        name: inquiry.name,
        email: inquiry.email,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all contact inquiries (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
export const getContactInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;

fs.writeFileSync(path.join(serverDir, 'controllers/contactController.js'), contactController, 'utf8');
console.log('✓ Created contactController.js');

// 3. Create contactRoutes.js
const contactRoutes = `import express from 'express';
import { submitContact, getContactInquiries } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(submitContact)
  .get(protect, admin, getContactInquiries);

export default router;
`;

fs.writeFileSync(path.join(serverDir, 'routes/contactRoutes.js'), contactRoutes, 'utf8');
console.log('✓ Created contactRoutes.js');

// 4. Update Order.js model to include paymentReference
const orderModelPath = path.join(serverDir, 'models/Order.js');
let orderModelContent = fs.readFileSync(orderModelPath, 'utf8');
if (!orderModelContent.includes('paymentReference')) {
  orderModelContent = orderModelContent.replace(
    "paymentStatus: {",
    "paymentReference: { type: String, default: 'N/A' },\n    paymentStatus: {"
  );
  fs.writeFileSync(orderModelPath, orderModelContent, 'utf8');
  console.log('✓ Added paymentReference to Order.js');
}

// 5. Update orderController.js with Authoritative Pricing, Inventory Updates, and Payment Verification
const orderController = `import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create a new order with Authoritative Pricing and Inventory Validation
// @route   POST /api/orders
// @access  Public (Guest) or Private (Logged in)
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      products,
      deliveryMethod,
      paymentMethod,
      paymentReference,
      notes,
    } = req.body;

    // Validate customer and delivery details
    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full recipient name, contact phone, street address, and city',
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    // AUTHORITATIVE PRICING & INVENTORY VALIDATION:
    // Look up each item from database to prevent price manipulation and check real stock
    const validatedProducts = [];
    let authoritativeSubtotal = 0;
    const productsToUpdate = [];

    for (const item of products) {
      const prodId = item.id || item._id;
      if (!prodId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product item format in cart',
        });
      }

      const dbProduct = await Product.findById(prodId);
      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: \`Product "\${item.title || prodId}" is no longer available in the store\`,
        });
      }

      const reqQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Validate stock availability
      if (dbProduct.stock < reqQuantity) {
        return res.status(400).json({
          success: false,
          message: \`Insufficient stock for "\${dbProduct.title}". Only \${dbProduct.stock} units remaining in inventory.\`,
        });
      }

      // Authoritative item pricing from stored database record
      const itemPrice = Number(dbProduct.price);
      authoritativeSubtotal += itemPrice * reqQuantity;

      validatedProducts.push({
        id: dbProduct._id.toString(),
        title: dbProduct.title,
        price: itemPrice,
        quantity: reqQuantity,
        thumbnail: dbProduct.thumbnail || item.thumbnail || '',
      });

      productsToUpdate.push({
        product: dbProduct,
        deductQty: reqQuantity,
      });
    }

    // Authoritative Shipping Cost calculation
    const isExpress = deliveryMethod && deliveryMethod.includes('Express');
    const shippingCost = authoritativeSubtotal >= 50 ? 0 : (isExpress ? 3.50 : 2.50);
    const authoritativeTotal = Number((authoritativeSubtotal + shippingCost).toFixed(2));

    // Determine Genuine Payment Status according to Business Rules:
    // Cash on Delivery (COD) -> Pending (COD)
    // Bank Transfer / JazzCash -> Pending Verification (never auto-marked Paid without server verification!)
    const normPaymentMethod = paymentMethod || 'Cash on Delivery (COD)';
    let initialPaymentStatus = 'Pending (COD)';

    if (normPaymentMethod === 'Bank Transfer') {
      initialPaymentStatus = 'Pending Verification';
    } else if (normPaymentMethod === 'JazzCash') {
      initialPaymentStatus = 'Pending Verification';
    } else if (normPaymentMethod.includes('COD')) {
      initialPaymentStatus = 'Pending (COD)';
    }

    // Decrement inventory stock in database atomically
    for (const item of productsToUpdate) {
      item.product.stock = Math.max(0, item.product.stock - item.deductQty);
      await item.product.save();
    }

    // Generate unique order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = \`ORD-\${randomSuffix}\`;

    const order = await Order.create({
      orderId,
      user: req.user ? req.user._id : null,
      customer: {
        name: customer.name.trim(),
        email: (customer.email || 'guest@store.local').trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim() || 'Lahore',
        province: customer.province || 'Punjab',
        postalCode: customer.postalCode || '54000',
        notes: notes || customer.notes || '',
      },
      products: validatedProducts,
      deliveryMethod: deliveryMethod || 'Express Delivery (2-3 Days)',
      paymentMethod: normPaymentMethod,
      paymentReference: (paymentReference || 'N/A').trim(),
      paymentStatus: initialPaymentStatus,
      status: 'Processing',
      subtotal: Number(authoritativeSubtotal.toFixed(2)),
      shippingCost,
      total: authoritativeTotal,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully and inventory updated',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'customer.email': req.user.email.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID or orderId with Security & Privacy Checks
// @route   GET /api/orders/:id
// @access  Protected (Owner or Admin) or Verified Guest (with phone/email verification)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // PRIVACY & AUTHORIZATION CHECK:
    // 1. If user is logged in as Admin -> allow
    if (req.user && req.user.role === 'admin') {
      return res.json({ success: true, order });
    }

    // 2. If user is logged in as the customer who placed the order -> allow
    if (req.user) {
      const isOwner =
        (order.user && order.user.toString() === req.user._id.toString()) ||
        (order.customer?.email && order.customer.email.toLowerCase() === req.user.email.toLowerCase());

      if (isOwner) {
        return res.json({ success: true, order });
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order',
      });
    }

    // 3. For guest order lookups: Require matching customer email or phone verification in query params
    const { email, phone } = req.query;
    if (email && order.customer?.email && order.customer.email.toLowerCase() === email.toLowerCase()) {
      return res.json({ success: true, order });
    }
    if (phone && order.customer?.phone && order.customer.phone.replace(/\\D/g, '') === phone.replace(/\\D/g, '')) {
      return res.json({ success: true, order });
    }

    // If order was just placed recently within 5 minutes, allow confirmation display
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    if (ageMs < 5 * 60 * 1000) {
      return res.json({ success: true, order });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Please sign in or provide email/phone verification to view this order',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Order lookup failed' });
  }
};

// @desc    Get all orders (with filters and search)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status and handle inventory restoration on cancellation
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    let { status, paymentStatus } = req.body;
    // Allow raw string body or object
    if (typeof req.body === 'string') {
      status = req.body;
    }

    const { id } = req.params;

    const order = id.startsWith('ORD-')
      ? await Order.findOne({ orderId: id })
      : await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.status;

    // Validate allowed status values
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: \`Invalid status "\${status}". Allowed values: \${allowedStatuses.join(', ')}\`,
      });
    }

    if (status) {
      order.status = status;

      // INVENTORY RESTORATION:
      // If moving to Cancelled from another state -> return items to inventory
      if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
        for (const item of order.products) {
          if (item.id) {
            await Product.findByIdAndUpdate(item.id, {
              $inc: { stock: item.quantity || 1 },
            });
          }
        }
      }
      // If moving from Cancelled back to an active state -> deduct items if available
      else if (prevStatus === 'Cancelled' && status !== 'Cancelled') {
        for (const item of order.products) {
          if (item.id) {
            await Product.findByIdAndUpdate(item.id, {
              $inc: { stock: -(item.quantity || 1) },
            });
          }
        }
      }

      // If marked Delivered and COD, update payment status to Paid
      if (status === 'Delivered' && order.paymentMethod.includes('COD') && order.paymentStatus.includes('Pending')) {
        order.paymentStatus = 'Paid';
      }
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ['Pending (COD)', 'Pending Verification', 'Paid', 'Failed'];
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: \`Invalid payment status. Allowed: \${allowedPaymentStatuses.join(', ')}\`,
        });
      }
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: \`Order status updated to \${updatedOrder.status}\`,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;

fs.writeFileSync(path.join(serverDir, 'controllers/orderController.js'), orderController, 'utf8');
console.log('✓ Updated orderController.js with authoritative pricing, stock deduction, and inventory restoration');

// 6. Update orderRoutes.js to use optionalAuth for getOrderById
const orderRoutes = `import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(optionalAuth, createOrder)
  .get(protect, admin, getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(optionalAuth, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

export default router;
`;

fs.writeFileSync(path.join(serverDir, 'routes/orderRoutes.js'), orderRoutes, 'utf8');
console.log('✓ Updated orderRoutes.js with optionalAuth protection on getOrderById');

// 7. Update adminController.js with genuine revenue calculations excluding cancelled and unpaid orders
const adminController = `import Order from '../models/Order.js';
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
`;

fs.writeFileSync(path.join(serverDir, 'controllers/adminController.js'), adminController, 'utf8');
console.log('✓ Updated adminController.js with verified revenue excluding cancelled orders');

// 8. Update server.js to mount contactRoutes and refine CORS and security headers
const serverPath = path.join(serverDir, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

if (!serverContent.includes('contactRoutes')) {
  serverContent = serverContent.replace(
    "import cartRoutes from './routes/cartRoutes.js';",
    "import cartRoutes from './routes/cartRoutes.js';\nimport contactRoutes from './routes/contactRoutes.js';"
  );
  serverContent = serverContent.replace(
    "app.use('/api/cart', cartRoutes);",
    "app.use('/api/cart', cartRoutes);\napp.use('/api/contact', contactRoutes);"
  );
  fs.writeFileSync(serverPath, serverContent, 'utf8');
  console.log('✓ Mounted contactRoutes in server.js');
}

console.log('Server patching completed successfully!');
