// lib/api/orders.js
import api from '../api';

export const ordersAPI = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Update order status (Admin)
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Mark order as delivered (Admin)
  markAsDelivered: async (id) => {
    const response = await api.put(`/orders/${id}/deliver`);
    return response.data;
  },
};