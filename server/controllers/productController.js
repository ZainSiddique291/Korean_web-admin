import Product from '../models/Product.js';

// @desc    Fetch all products with filtering, search, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const query = {};

    // Category or skin concern filter
    if (category && category !== 'all') {
      query.$or = [
        { category: { $regex: new RegExp(`^${category}$`, 'i') } },
        { colorLabel: { $regex: new RegExp(`^${category}$`, 'i') } },
        { tag: { $regex: category, $options: 'i' } },
        { title: { $regex: category, $options: 'i' } },
      ];
    }

    // Keyword search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { brand: searchRegex },
        { tag: searchRegex },
        { keyIngredients: searchRegex },
        { benefits: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    let productsQuery = Product.find(query);

    // Sorting
    if (sort === 'price-asc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'price-desc') {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === 'rating') {
      productsQuery = productsQuery.sort({ rating: -1 });
    } else if (sort === 'newest') {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    } else {
      // Default: featured or newest
      productsQuery = productsQuery.sort({ isFeatured: -1, createdAt: -1 });
    }

    const products = await productsQuery;

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Invalid product ID or not found' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      stock,
      category,
      thumbnail,
      images,
      brand,
      benefits,
      skinType,
      howToUse,
      isFeatured,
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide title and price' });
    }

    const product = await Product.create({
      title,
      description: description || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: stock !== undefined ? Number(stock) : 20,
      category: category || 'skincare',
      thumbnail:
        thumbnail || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
      images: images || [],
      brand: brand || 'Seoul Glow',
      benefits: benefits || ['Deep Hydration', 'Barrier Repair'],
      skinType: skinType || 'All Skin Types',
      howToUse: howToUse || 'Apply 2-3 drops to clean skin and gently pat in.',
      isFeatured: !!isFeatured,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.deleteOne({ _id: product._id });

    res.json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
