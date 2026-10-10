import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter product title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      default: 20,
      min: [0, 'Stock cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      default: 'skincare',
      lowercase: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Please provide a product thumbnail image URL'],
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 12,
    },
    brand: {
      type: String,
      default: 'SEORA',
      trim: true,
    },
    tag: {
      type: String,
      default: '',
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    netVol: {
      type: String,
      default: '30ml',
    },
    origin: {
      type: String,
      default: 'Made in Korea',
    },
    colorLabel: {
      type: String,
      enum: ['green', 'blue', 'maroon', 'orange'],
      default: 'green',
    },
    keyIngredients: {
      type: [String],
      default: [],
    },
    fullIngredients: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    skinType: {
      type: String,
      default: 'All Skin Types',
    },
    howToUse: {
      type: String,
      default: '',
    },
    precautions: {
      type: [String],
      default: [],
    },
    koreanText: {
      headline: { type: String, default: '' },
      notes: { type: [String], default: [] },
      usage: { type: String, default: '' },
      precautions: { type: String, default: '' },
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property so frontend can access item.id as well as item._id
productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
