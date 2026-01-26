import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [], totalPrice: 0 } });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user.id });

    const item = {
      product: product._id,
      quantity,
      price: product.price,
    };

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [item],
        totalPrice: product.price * quantity,
      });
    } else {
      const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push(item);
      }
      cart.totalPrice = cart.items.reduce((sum, it) => sum + it.quantity * it.price, 0);
      await cart.save();
    }

    const populated = await cart.populate('items.product');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Product not in cart' });

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce((sum, it) => sum + it.quantity * it.price, 0);
    await cart.save();

    const populated = await cart.populate('items.product');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    cart.totalPrice = cart.items.reduce((sum, it) => sum + it.quantity * it.price, 0);
    await cart.save();

    const populated = await cart.populate('items.product');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};