import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    thumbnail: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customer: {
      name: { type: String, required: [true, 'Customer name is required'] },
      email: { type: String, required: [true, 'Customer email is required'], lowercase: true },
      phone: { type: String, required: [true, 'Customer phone number is required'] },
      address: { type: String, required: [true, 'Shipping address is required'] },
      city: { type: String, default: 'Lahore' },
      province: { type: String, default: 'Punjab' },
      postalCode: { type: String, default: '54000' },
      notes: { type: String, default: '' },
    },
    products: [orderItemSchema],
    deliveryMethod: {
      type: String,
      default: 'Express Delivery (2-3 Days)',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery (COD)', 'Bank Transfer', 'JazzCash', 'Card'],
      default: 'Cash on Delivery (COD)',
    },
    paymentReference: { type: String, default: 'N/A' },
    paymentStatus: {
      type: String,
      enum: ['Pending (COD)', 'Pending Verification', 'Paid', 'Failed'],
      default: 'Pending (COD)',
    },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual id matching frontend expectation
orderSchema.virtual('id').get(function () {
  return this.orderId || this._id.toHexString();
});

// Virtual date matching frontend expectation
orderSchema.virtual('date').get(function () {
  return this.createdAt ? this.createdAt.toISOString() : new Date().toISOString();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
