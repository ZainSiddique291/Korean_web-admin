import User from '../models/User.js';

// @desc    Get user's server-saved cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cart');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      cart: user.cart || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync / Merge client cart with server cart
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  try {
    const { items = [], merge = false } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (merge) {
      // Merge strategy: combine guest localStorage items with existing DB items
      const existingCart = user.cart || [];
      const itemMap = new Map();

      // Load existing server items
      existingCart.forEach((item) => {
        itemMap.set(String(item.id), {
          id: String(item.id),
          title: item.title,
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          thumbnail: item.thumbnail || '',
          category: item.category || 'skincare',
        });
      });

      // Overlay incoming guest items (add quantities if item exists)
      items.forEach((item) => {
        const id = String(item.id || item._id);
        const qty = Number(item.quantity) || 1;

        if (itemMap.has(id)) {
          const current = itemMap.get(id);
          current.quantity += qty;
        } else {
          itemMap.set(id, {
            id,
            title: item.title,
            price: Number(item.price),
            quantity: qty,
            thumbnail: item.thumbnail || '',
            category: item.category || 'skincare',
          });
        }
      });

      user.cart = Array.from(itemMap.values());
    } else {
      // Direct overwrite strategy (used during active browsing modifications)
      user.cart = items.map((item) => ({
        id: String(item.id || item._id),
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        thumbnail: item.thumbnail || '',
        category: item.category || 'skincare',
      }));
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Cart synced with server successfully',
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear server cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.cart = [];
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Server cart cleared',
      cart: [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
