// src/controllers/orderController.js
// UPDATED createOrder to support guest checkout
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private OR Guest (with guestName/guestEmail)
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      taxPrice,
      shippingPrice,
      totalPrice,
      // Guest fields (optional)
      guestName,
      guestEmail,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const mappedOrderItems = orderItems.map(item => ({
      product: item.product,
      name: item.name,
      qty: item.qty || item.quantity || 1,
      price: item.price,
    }));

    // Determine buyer info (logged-in user or guest)
    const buyerName = req.user?.name || guestName || 'Guest';
    const buyerEmail = req.user?.email || guestEmail;

    const orderData = {
      orderItems: mappedOrderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
    };

    // Only set user if authenticated
    if (req.user?.id) {
      orderData.user = req.user.id;
    }

    // Store guest info if no user
    if (!req.user?.id) {
      orderData.guestName = guestName;
      orderData.guestEmail = guestEmail;
    }

    const order = await Order.create(orderData);

    // Update product stock
    for (const item of mappedOrderItems) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.qty;
          await product.save();
        }
      } catch (stockError) {
        console.error('Stock update error:', stockError);
      }
    }

    // Clear user cart if authenticated
    if (req.user?.id) {
      try {
        await Cart.findOneAndDelete({ user: req.user.id });
      } catch (cartError) {
        console.error('Cart clear error:', cartError);
      }
    }

    // Send buyer confirmation email
    if (buyerEmail) {
      try {
        const buyerHtml = `
          <h1>Order Confirmation</h1>
          <p>Hi ${buyerName},</p>
          <p>Thank you for your order! Your order #${order._id} has been confirmed.</p>
          <h2>Order Details:</h2>
          <ul>
            ${mappedOrderItems.map(item => `<li>${item.name} x ${item.qty} - £${item.price.toFixed(2)}</li>`).join('')}
          </ul>
          <p><strong>Total: £${totalPrice.toFixed(2)}</strong></p>
          <br>
          <p>We'll send you a shipping notification when your order is on its way.</p>
          <br>
          <p>Best regards,<br>EloraVista Team</p>
        `;
        await sendEmail({ email: buyerEmail, subject: `Order Confirmation - #${order._id}`, html: buyerHtml });
      } catch (emailError) {
        console.error('Buyer email error:', emailError);
      }
    }

    // Send admin notification
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const guestTag = !req.user?.id ? ' [GUEST ORDER]' : '';
        const adminHtml = `
          <h1>🎉 New Order Received!${guestTag}</h1>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${buyerName} (${buyerEmail || 'N/A'})${!req.user?.id ? ' <em>(Guest)</em>' : ''}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Payment Status:</strong> ✅ Paid</p>
          <br>
          <h2>Order Items:</h2>
          <ul>
            ${mappedOrderItems.map(item => `<li>${item.name} x ${item.qty} - £${(item.qty * item.price).toFixed(2)}</li>`).join('')}
          </ul>
          <p><strong>Total: £${totalPrice.toFixed(2)}</strong></p>
          <br>
          <h3>Shipping Address:</h3>
          <p>${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}</p>
          <p>Phone: ${shippingAddress.phone}</p>
        `;
        await sendEmail({ email: adminEmail, subject: `🛒 New Order${guestTag} #${order._id} - £${totalPrice.toFixed(2)}`, html: adminHtml });
      }
    } catch (adminEmailError) {
      console.error('Admin email error:', adminEmailError);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (or guest by order ID if you want)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Allow access if user owns order, is admin, or it's a guest order with no user
    const isOwner = order.user && order.user._id.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const isGuestOrder = !order.user;

    if (!isOwner && !isAdmin && !isGuestOrder) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (including guest orders)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    const updatedOrder = await order.save();

    // Send delivery notification
    const buyerEmail = order.user ? (await User.findById(order.user))?.email : order.guestEmail;
    const buyerName = order.user ? (await User.findById(order.user))?.name : order.guestName || 'Customer';

    if (buyerEmail) {
      const html = `
        <h1>Order Delivered!</h1>
        <p>Hi ${buyerName},</p>
        <p>Your order #${order._id} has been delivered. Thank you for shopping with EloraVista!</p>
      `;
      await sendEmail({ email: buyerEmail, subject: `Order Delivered - #${order._id}`, html });
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;

    if (status === 'shipped') {
      const buyerEmail = order.user ? (await User.findById(order.user))?.email : order.guestEmail;
      const buyerName = order.user ? (await User.findById(order.user))?.name : order.guestName || 'Customer';
      if (buyerEmail) {
        const html = `
          <h1>Order Shipped!</h1>
          <p>Hi ${buyerName},</p>
          <p>Your order #${order._id} has been shipped and is on its way to you!</p>
          <p>Best regards,<br>EloraVista Team</p>
        `;
        await sendEmail({ email: buyerEmail, subject: `Order Shipped - #${order._id}`, html });
      }
    }

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};