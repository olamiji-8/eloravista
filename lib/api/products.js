// lib/api/products.js
import api from '../api';

export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    const { category, search, page = 1, limit = 12, sort = '-createdAt' } = params;
    const queryParams = new URLSearchParams();
    
    if (category && category !== 'All Categories') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};