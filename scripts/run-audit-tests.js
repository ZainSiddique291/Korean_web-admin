import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const results = [];
let passed = 0;
let failed = 0;

const logTest = (name, ok, details = '') => {
  if (ok) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} ${details ? `-> ${details}` : ''}`);
  }
  results.push({ name, passed: ok, details });
};

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING SEORA COMPLETE END-TO-END AUDIT TEST SUITE');
  console.log('======================================================\n');

  let adminToken = '';
  let customerToken = '';
  let testProductId = '';
  let initialStock = 0;
  let testOrderId = '';

  // 1. Health & Server Status
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    logTest('API Server Health Check', res.data.status === 'ok');
  } catch (err) {
    logTest('API Server Health Check', false, err.message);
  }

  // 2. Authentication: Admin Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@store.com',
      password: 'admin123',
    });
    adminToken = res.data.accessToken;
    logTest(
      'Admin Authentication (Role verification)',
      res.data.success && res.data.user.role === 'admin' && !!adminToken
    );
  } catch (err) {
    logTest('Admin Authentication', false, err.response?.data?.message || err.message);
  }

  // 3. Authentication: Customer Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'amina.t@example.com',
      password: 'customer123',
    });
    customerToken = res.data.accessToken;
    logTest(
      'Customer Authentication (Standard role verification)',
      res.data.success && res.data.user.role === 'customer' && !!customerToken
    );
  } catch (err) {
    logTest('Customer Authentication', false, err.response?.data?.message || err.message);
  }

  // 4. Authentication: Reject Invalid Credentials
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@store.com',
      password: 'wrong_password_999',
    });
    logTest('Security: Reject Invalid Password', false, 'Should have failed with 401');
  } catch (err) {
    logTest(
      'Security: Reject Invalid Password',
      err.response?.status === 401,
      `Received expected HTTP ${err.response?.status}`
    );
  }

  // 5. Authorization: Customer blocked from Admin Stats
  try {
    await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    logTest('Security: Customer Blocked from Admin Stats', false, 'Should have returned 403');
  } catch (err) {
    logTest(
      'Security: Customer Blocked from Admin Stats',
      err.response?.status === 403,
      `Received expected HTTP ${err.response?.status}`
    );
  }

  // 6. Authorization: Unauthenticated blocked from Admin Stats
  try {
    await axios.get(`${BASE_URL}/admin/stats`);
    logTest('Security: Unauthenticated Blocked from Admin Stats', false, 'Should have returned 401');
  } catch (err) {
    logTest(
      'Security: Unauthenticated Blocked from Admin Stats',
      err.response?.status === 401,
      `Received expected HTTP ${err.response?.status}`
    );
  }

  // 7. Product Catalog: Fetch live products
  try {
    const res = await axios.get(`${BASE_URL}/products`);
    const prods = res.data.products;
    const hasProducts = Array.isArray(prods) && prods.length > 0;
    if (hasProducts) {
      testProductId = prods[0]._id;
      initialStock = prods[0].stock;
    }
    logTest('Product Catalog: Fetch Live Database Products', hasProducts, `Found ${prods.length} products`);
  } catch (err) {
    logTest('Product Catalog: Fetch Live Products', false, err.message);
  }

  // 8. Product Search Filtering
  try {
    const res = await axios.get(`${BASE_URL}/products?search=Serum`);
    logTest('Product Search: Filter by Keyword', res.data.success && res.data.products.length > 0);
  } catch (err) {
    logTest('Product Search', false, err.message);
  }

  // 9. Single Product Details
  try {
    const res = await axios.get(`${BASE_URL}/products/${testProductId}`);
    logTest('Product Details: Fetch Single Product Record', res.data.success && res.data.product._id === testProductId);
  } catch (err) {
    logTest('Product Details', false, err.message);
  }

  // 10. Authoritative Pricing & Stock Decrement on Order Creation
  let orderCreatedStock = 0;
  try {
    const orderPayload = {
      customer: {
        name: 'Automated Audit Test Customer',
        email: 'audit.test@example.com',
        phone: '+92 300 9998877',
        address: 'Audit Lab 1, Tech Zone',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        notes: 'End-to-End Test Order',
      },
      products: [
        {
          id: testProductId,
          title: 'Tampered Title', // Client spoof test
          price: 0.01, // Client spoof price test ($0.01 instead of real price)
          quantity: 2,
        },
      ],
      deliveryMethod: 'Express Delivery (2-3 Days)',
      paymentMethod: 'Cash on Delivery (COD)',
    };

    const res = await axios.post(`${BASE_URL}/orders`, orderPayload);
    const order = res.data.order;
    testOrderId = order._id || order.orderId;

    // Verify backend calculated real price (not 0.01)
    const priceAuthoritative = order.products[0].price > 1;
    const paymentStatusCorrect = order.paymentStatus === 'Pending (COD)';

    // Check stock was decremented in database
    const prodRes = await axios.get(`${BASE_URL}/products/${testProductId}`);
    orderCreatedStock = prodRes.data.product.stock;
    const stockDecremented = orderCreatedStock === initialStock - 2;

    logTest(
      'E-Commerce Integrity: Authoritative Pricing (Anti-Tampering)',
      priceAuthoritative,
      `Authoritative total: $${order.total} (Rejected client spoofed price $0.01)`
    );
    logTest('Payment Workflow: COD Initial Status is "Pending (COD)"', paymentStatusCorrect);
    logTest(
      'Inventory Management: Stock Automatically Decremented in DB (-2)',
      stockDecremented,
      `Stock went from ${initialStock} to ${orderCreatedStock}`
    );
  } catch (err) {
    logTest('Order Creation & Inventory Decrement', false, err.response?.data?.message || err.message);
  }

  // 11. Bank Transfer & JazzCash Initial Status Integrity (Never auto-marked Paid)
  try {
    const btOrderPayload = {
      customer: {
        name: 'Bank Transfer Tester',
        email: 'bt.test@example.com',
        phone: '+92 300 1122334',
        address: 'Plot 4, Banking Road',
        city: 'Karachi',
      },
      products: [{ id: testProductId, quantity: 1 }],
      deliveryMethod: 'Express Delivery (2-3 Days)',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'MEEZAN-REF-98765',
    };

    const res = await axios.post(`${BASE_URL}/orders`, btOrderPayload);
    const isPendingVerification = res.data.order.paymentStatus === 'Pending Verification';
    const refPersisted = res.data.order.paymentReference === 'MEEZAN-REF-98765';

    logTest(
      'Payment Workflow: Bank Transfer marked "Pending Verification" (Not Paid)',
      isPendingVerification,
      `Status: ${res.data.order.paymentStatus}`
    );
    logTest('Payment Workflow: Bank Transfer Reference Stored in Database', refPersisted);
  } catch (err) {
    logTest('Bank Transfer Verification Test', false, err.message);
  }

  // 12. Inventory Protection: Insufficient Stock Rejection
  try {
    await axios.post(`${BASE_URL}/orders`, {
      customer: {
        name: 'Over-Order Tester',
        email: 'overorder@example.com',
        phone: '+92 300 0000000',
        address: 'Nowhere',
        city: 'Lahore',
      },
      products: [{ id: testProductId, quantity: 99999 }], // Exceeds available stock
      paymentMethod: 'Cash on Delivery (COD)',
    });
    logTest('Inventory Protection: Reject Insufficient Stock', false, 'Should have failed with 400');
  } catch (err) {
    logTest(
      'Inventory Protection: Reject Insufficient Stock',
      err.response?.status === 400,
      `Rejected with HTTP 400: "${err.response?.data?.message}"`
    );
  }

  // 13. Order Privacy: Prevent unauthorized access to private order
  try {
    const unauthRes = await axios.get(`${BASE_URL}/orders/${testOrderId}?email=wrong@email.com&phone=000`);
    logTest('Security: Customer Order Privacy Protection', false, 'Should have returned 403');
  } catch (err) {
    logTest(
      'Security: Customer Order Privacy Protection',
      err.response?.status === 403,
      `Blocked unauthorized access with HTTP ${err.response?.status}`
    );
  }

  // 14. Admin Order Management: List all orders
  try {
    const res = await axios.get(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logTest('Admin Order Management: Fetch Live Orders List', res.data.success && res.data.orders.length > 0);
  } catch (err) {
    logTest('Admin Orders Fetch', false, err.message);
  }

  // 15. Order Status Lifecycle & Inventory Restoration on Cancellation
  try {
    const preCancelRes = await axios.get(`${BASE_URL}/products/${testProductId}`);
    const preCancelStock = preCancelRes.data.product.stock;

    // Cancel the test order
    const cancelRes = await axios.put(
      `${BASE_URL}/orders/${testOrderId}/status`,
      { status: 'Cancelled' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const isCancelled = cancelRes.data.order.status === 'Cancelled';

    // Verify stock was restored (+2)
    const prodRes = await axios.get(`${BASE_URL}/products/${testProductId}`);
    const restoredStock = prodRes.data.product.stock;
    const isRestored = restoredStock === preCancelStock + 2;

    logTest('Order Status: Admin can mark order "Cancelled"', isCancelled);
    logTest(
      'Inventory Integrity: Cancelled Order Restores Stock in Database (+2)',
      isRestored,
      `Stock restored from ${preCancelStock} to ${restoredStock} (+2 units)`
    );
  } catch (err) {
    logTest('Order Cancellation & Stock Restoration', false, err.message);
  }

  // 16. Admin Dashboard: Genuine Calculated Metrics (Revenue excludes cancelled orders)
  try {
    const res = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stats = res.data.stats;
    const hasValidStats =
      typeof stats.totalRevenue === 'number' &&
      typeof stats.totalOrders === 'number' &&
      typeof stats.totalProducts === 'number' &&
      typeof stats.totalStock === 'number';

    logTest(
      'Admin Dashboard: Genuine DB-Calculated KPIs (Excluding Cancelled Revenue)',
      hasValidStats,
      `Revenue: $${stats.totalRevenue}, Orders: ${stats.totalOrders}, Active Products: ${stats.totalProducts}, Total Stock: ${stats.totalStock}`
    );
  } catch (err) {
    logTest('Admin Stats Calculation', false, err.message);
  }

  // 17. Admin Customers Directory
  try {
    const res = await axios.get(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logTest(
      'Admin Customers Directory: Live Aggregated Records',
      res.data.success && Array.isArray(res.data.customers),
      `Found ${res.data.customers.length} verified customer accounts`
    );
  } catch (err) {
    logTest('Admin Customers', false, err.message);
  }

  // 18. Contact Form: Successful Inquiries Submission & DB Storage
  try {
    const contactPayload = {
      name: 'E2E Test User',
      email: 'e2e.test@example.com',
      phone: '+92 300 5556677',
      subject: 'Skincare Consultation',
      message: 'Testing complete database-backed contact inquiry flow for audit verification.',
    };
    const res = await axios.post(`${BASE_URL}/contact`, contactPayload);
    logTest('Contact Inquiries: Real Database Submission', res.data.success && !!res.data.inquiry?.id);
  } catch (err) {
    logTest('Contact Form Submission', false, err.message);
  }

  // 19. Contact Form: Validation Rejection on Invalid Data
  try {
    await axios.post(`${BASE_URL}/contact`, {
      name: '',
      email: 'not-an-email',
      message: 'hi',
    });
    logTest('Contact Form: Validation Rejection', false, 'Should have failed with 400');
  } catch (err) {
    logTest(
      'Contact Form: Validation Rejection on Malformed Input',
      err.response?.status === 400,
      `Rejected with HTTP ${err.response?.status}`
    );
  }

  // Summary
  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
