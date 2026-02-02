// src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    colors: [{ type: String, trim: true }], // Array of color strings
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    // ...any other fields...
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);