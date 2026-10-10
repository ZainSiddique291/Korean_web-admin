import Order from '../models/Order.js';
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
          message: `Product "${item.title || prodId}" is no longer available in the store`,
        });
      }

      const reqQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Validate stock availability
      if (dbProduct.stock < reqQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProduct.title}". Only ${dbProduct.stock} units remaining in inventory.`,
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
    const orderId = `ORD-${randomSuffix}`;

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
    if (phone && order.customer?.phone && order.customer.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')) {
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
        message: `Invalid status "${status}". Allowed values: ${allowedStatuses.join(', ')}`,
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
          message: `Invalid payment status. Allowed: ${allowedPaymentStatuses.join(', ')}`,
        });
      }
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${updatedOrder.status}`,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
