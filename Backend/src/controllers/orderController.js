// src/controllers/orderController.js
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
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
    } = req.body;

    console.log('=== CREATE ORDER ===');
    console.log('User:', req.user.id);
    console.log('Order items:', orderItems);

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items',
      });
    }

    // Map orderItems to match schema (quantity → qty)
    const mappedOrderItems = orderItems.map(item => ({
      product: item.product,
      name: item.name,
      qty: item.qty || item.quantity || 1,
      price: item.price,
    }));

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems: mappedOrderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
    });

    console.log('Order created:', order._id);

    // Update product stock
    for (const item of mappedOrderItems) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.qty;
          await product.save();
          console.log(`Updated stock for ${item.name}`);
        }
      } catch (stockError) {
        console.error('Stock update error:', stockError);
      }
    }

    // Clear user cart
    try {
      await Cart.findOneAndDelete({ user: req.user.id });
      console.log('Cart cleared');
    } catch (cartError) {
      console.error('Cart clear error:', cartError);
    }

    // ===== SEND BUYER CONFIRMATION EMAIL =====
    try {
      const buyerHtml = `
        <h1>Order Confirmation</h1>
        <p>Hi ${req.user.name},</p>
        <p>Thank you for your order! Your order #${order._id} has been confirmed.</p>
        <h2>Order Details:</h2>
        <ul>
          ${mappedOrderItems.map(item => `
            <li>${item.name} x ${item.qty} - £${item.price.toFixed(2)}</li>
          `).join('')}
        </ul>
        <p><strong>Subtotal: £${(totalPrice - shippingPrice - taxPrice).toFixed(2)}</strong></p>
        <p><strong>Shipping: £${shippingPrice.toFixed(2)}</strong></p>
        <p><strong>Tax: £${taxPrice.toFixed(2)}</strong></p>
        <p><strong>Total: £${totalPrice.toFixed(2)}</strong></p>
        <br>
        <p>We'll send you a shipping notification when your order is on its way.</p>
        <br>
        <p>Best regards,<br>EloraVista Team</p>
      `;

      await sendEmail({
        email: req.user.email,
        subject: `Order Confirmation - #${order._id}`,
        html: buyerHtml,
      });
      
      console.log('Buyer email sent to:', req.user.email);
    } catch (emailError) {
      console.error('Buyer email error:', emailError);
    }

    // ===== SEND ADMIN NOTIFICATION EMAIL =====
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (adminEmail) {
        const adminHtml = `
          <h1>🎉 New Order Received!</h1>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${req.user.name} (${req.user.email})</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Payment Status:</strong> ✅ Paid</p>
          <br>
          <h2>Order Items:</h2>
          <ul>
            ${mappedOrderItems.map(item => `
              <li>${item.name} x ${item.qty} - £${item.price.toFixed(2)} = £${(item.qty * item.price).toFixed(2)}</li>
            `).join('')}
          </ul>
          <br>
          <h3>Pricing Breakdown:</h3>
          <p>Subtotal: £${(totalPrice - shippingPrice - taxPrice).toFixed(2)}</p>
          <p>Shipping: £${shippingPrice.toFixed(2)}</p>
          <p>Tax: £${taxPrice.toFixed(2)}</p>
          <p><strong style="font-size: 18px;">Total: £${totalPrice.toFixed(2)}</strong></p>
          <br>
          <h3>Shipping Address:</h3>
          <p>${shippingAddress.street}</p>
          <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
          <p>${shippingAddress.country}</p>
          <p>Phone: ${shippingAddress.phone}</p>
          <br>
          <p><em>Login to your admin dashboard to process this order.</em></p>
        `;

        await sendEmail({
          email: adminEmail,
          subject: `🛒 New Order #${order._id} - £${totalPrice.toFixed(2)}`,
          html: adminHtml,
        });
        
        console.log('Admin notification sent to:', adminEmail);
      } else {
        console.warn('ADMIN_EMAIL not configured in .env');
      }
    } catch (adminEmailError) {
      console.error('Admin email error:', adminEmailError);
      // Don't fail the order if admin email fails
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error(error);
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    // Send delivery notification email
    const user = await User.findById(order.user);

    const html = `
      <h1>Order Delivered!</h1>
      <p>Hi ${user.name},</p>
      <p>Your order #${order._id} has been delivered.</p>
      <p>Thank you for shopping with EloraVista!</p>
      <br>
      <p>Best regards,<br>EloraVista Team</p>
    `;

    await sendEmail({
      email: user.email,
      subject: `Order Delivered - #${order._id}`,
      html,
    });

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;

    if (status === 'shipped') {
      // Send shipping notification
      const user = await User.findById(order.user);

      const html = `
        <h1>Order Shipped!</h1>
        <p>Hi ${user.name},</p>
        <p>Your order #${order._id} has been shipped and is on its way to you.</p>
        <p>Thank you for your patience!</p>
        <br>
        <p>Best regards,<br>EloraVista Team</p>
      `;

      await sendEmail({
        email: user.email,
        subject: `Order Shipped - #${order._id}`,
        html,
      });
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};