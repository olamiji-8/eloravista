// lib/api/contact.js
import api from '../api';

export const contactAPI = {
  // Submit contact form
  submitContact: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },

  // Get all contacts (Admin)
  getAllContacts: async () => {
    const response = await api.get('/contact');
    return response.data;
  },
};