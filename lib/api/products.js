// lib/api/products.js
import api from '../api';

export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    const { category, search, page = 1, limit = 12, sort = '-createdAt', featured } = params;
    const queryParams = new URLSearchParams();
    
    if (category && category !== 'All Categories') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    if (featured !== undefined) queryParams.append('featured', featured);
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sort', sort);

    const response = await api.get(`/products?${queryParams.toString()}`);
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product (Admin)
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Unfeature a single product (Admin)
  unfeatureProduct: async (id) => {
    const response = await api.patch(`/products/${id}/unfeature`);
    return response.data;
  },

  // Unfeature ALL featured products (Admin)
  unfeatureAllProducts: async () => {
    const response = await api.patch('/products/unfeature-all');
    return response.data;
  },
};