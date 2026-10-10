import fs from 'fs';
import path from 'path';

const clientDir = path.resolve('../E_commerce2/client');

// 1. Update client api.js to export contactService
const clientApiPath = path.join(clientDir, 'src/services/api.js');
let clientApiContent = fs.readFileSync(clientApiPath, 'utf8');

if (!clientApiContent.includes('contactService')) {
  clientApiContent += `
export const contactService = {
  submitContact: async (data) => {
    const res = await api.post('/contact', data);
    return res.data;
  },
};
`;
  fs.writeFileSync(clientApiPath, clientApiContent, 'utf8');
  console.log('✓ Added contactService to client api.js');
}

// 2. Update ContactSection.jsx to call real contactService
const contactSectionPath = path.join(clientDir, 'src/Components/ContactSection.jsx');
let contactSectionContent = fs.readFileSync(contactSectionPath, 'utf8');

// Ensure import includes contactService
if (!contactSectionContent.includes('contactService')) {
  contactSectionContent = contactSectionContent.replace(
    "import { useApp } from '../context/AppContext';",
    "import { useApp } from '../context/AppContext';\nimport { contactService } from '../services/api';"
  );
}

// Replace handleSubmit with real async submission
const oldHandleSubmitRegex = /const handleSubmit = \(e\) => \{[\s\S]*?setForm\(\{ name: '', email: '', phone: '', subject: '', message: '' \}\);\s*\}, 800\);\s*\};/;

const newHandleSubmit = `const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast('Please fill in your name, email, and message.');
      return;
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactService.submitContact(form);
      setSubmitted(true);
      showToast(res.message || 'Your inquiry has been received! Our skincare team will reach out promptly.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit inquiry. Please try again.';
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };`;

contactSectionContent = contactSectionContent.replace(oldHandleSubmitRegex, newHandleSubmit);
fs.writeFileSync(contactSectionPath, contactSectionContent, 'utf8');
console.log('✓ Updated ContactSection.jsx with genuine database-backed submission');

// 3. Update AppContext.jsx: Remove mock INITIAL_ORDERS, fake google user, fake product fallbacks
const appContextPath = path.join(clientDir, 'src/context/AppContext.jsx');
let appContext = fs.readFileSync(appContextPath, 'utf8');

// Replace INITIAL_ORDERS declaration with empty array
appContext = appContext.replace(
  /const INITIAL_ORDERS = \[[\s\S]*?\];\s*(?=export const AppProvider)/,
  '// Genuine live orders loaded from database\n'
);

// Replace orders initial state
appContext = appContext.replace(
  /const \[orders, setOrders\] = useState\(\(\) => \{[\s\S]*?return INITIAL_ORDERS;\s*\}\s*\}\);/,
  'const [orders, setOrders] = useState([]);'
);

// Replace continueWithGoogle to stop faking "Ayesha Khan"
const oldGoogleUser = /const continueWithGoogle = \(\) => \{[\s\S]*?showToast\('Signed in with Google [^']*'\);\s*\};/;
const newGoogleUser = `const continueWithGoogle = () => {
    showToast('Google OAuth is not configured with client credentials. Please sign in with email/password or proceed as guest.');
  };`;
appContext = appContext.replace(oldGoogleUser, newGoogleUser);

// In fetchProducts, ensure genuine database response or empty array, never silent dummy replacement
const oldFetchProductsBody = /const data = await productService\.getProducts\(params\);[\s\S]*?setProducts\(\(prev\) => \(prev && prev\.length > 0 \? prev : DEFAULT_SEORA_PRODUCTS\)\);\s*\}\s*\}\s*catch\s*\{[\s\S]*?setProducts\(\(prev\) => \(prev && prev\.length > 0 \? prev : DEFAULT_SEORA_PRODUCTS\)\);/;
const newFetchProductsBody = `const data = await productService.getProducts(params);
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to product catalog');
      setProducts([]);`;

appContext = appContext.replace(oldFetchProductsBody, newFetchProductsBody);

// In addOrder, throw real error on failure, never generate fake local order
const oldAddOrderRegex = /const addOrder = async \(orderData\) => \{[\s\S]*?clearCart\(\);\s*return newOrder;\s*\};/;
const newAddOrder = `const addOrder = async (orderData) => {
    try {
      const res = await orderService.createOrder(orderData);
      if (res.success && res.order) {
        setOrders((prev) => [res.order, ...prev]);
        clearCart();
        return res.order;
      }
      throw new Error(res.message || 'Order creation failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      showToast(msg);
      throw err;
    }
  };`;

appContext = appContext.replace(oldAddOrderRegex, newAddOrder);

// In addProduct, updateProduct, deleteProduct, remove fake local fallbacks
const oldAddProduct = /const addProduct = async \(newProd\) => \{[\s\S]*?return product;\s*\}\s*\};/;
const newAddProduct = `const addProduct = async (newProd) => {
    try {
      const res = await productService.createProduct(newProd);
      if (res.success && res.product) {
        setProducts((prev) => [res.product, ...prev]);
        showToast('Product added successfully');
        return res.product;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add product');
      throw err;
    }
  };`;
appContext = appContext.replace(oldAddProduct, newAddProduct);

const oldUpdateProduct = /const updateProduct = async \(id, fields\) => \{[\s\S]*?showToast\('Product updated [^']*'\);\s*\}\s*\};/;
const newUpdateProduct = `const updateProduct = async (id, fields) => {
    try {
      const res = await productService.updateProduct(id, fields);
      if (res.success && res.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id || p._id === id ? res.product : p))
        );
        showToast('Product updated successfully');
        return res.product;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update product');
      throw err;
    }
  };`;
appContext = appContext.replace(oldUpdateProduct, newUpdateProduct);

const oldDeleteProduct = /const deleteProduct = async \(id\) => \{[\s\S]*?showToast\('Product removed'\);\s*\};/;
const newDeleteProduct = `const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      showToast('Product removed from store');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product');
      throw err;
    }
  };`;
appContext = appContext.replace(oldDeleteProduct, newDeleteProduct);

fs.writeFileSync(appContextPath, appContext, 'utf8');
console.log('✓ Purged mock data and fallbacks from AppContext.jsx');

// 4. Update ShippingPage.jsx payment status logic and error handling
const shippingPagePath = path.join(clientDir, 'src/pages/ShippingPage.jsx');
let shippingPage = fs.readFileSync(shippingPagePath, 'utf8');

// Replace paymentStatus assignment
const oldPaymentStatusAssignment = `    let paymentStatus = 'Pending (COD)';
    if (paymentMethod === 'Bank Transfer') {
      paymentStatus = 'Pending Verification';
    } else if (paymentMethod === 'JazzCash') {
      paymentStatus = 'Paid';
    }`;

const newPaymentStatusAssignment = `    let paymentStatus = 'Pending (COD)';
    if (paymentMethod === 'Bank Transfer') {
      paymentStatus = 'Pending Verification';
    } else if (paymentMethod === 'JazzCash') {
      paymentStatus = 'Pending Verification';
    }`;

shippingPage = shippingPage.replace(oldPaymentStatusAssignment, newPaymentStatusAssignment);

// In handleFinalConfirm, propagate real server errors without advancing
const oldConfirmCatch = `    try {
      const newOrder = await addOrder(orderPayload);
      setConfirmedOrder(newOrder);
      setStep(4);
      showToast('Order confirmed successfully! 🎉');
    } catch {
      showToast('Failed to place order. Please try again.');
    }`;

const newConfirmCatch = `    try {
      const newOrder = await addOrder(orderPayload);
      setConfirmedOrder(newOrder);
      setStep(4);
      showToast('Order confirmed successfully! 🎉');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order. Please check stock or details.';
      showToast(msg);
    }`;

shippingPage = shippingPage.replace(oldConfirmCatch, newConfirmCatch);

fs.writeFileSync(shippingPagePath, shippingPage, 'utf8');
console.log('✓ Updated ShippingPage.jsx payment status & error handling');

console.log('Client patching completed successfully!');
