// components/FeaturedProducts.jsx
'use client';

import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api/products';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await productsAPI.getProducts({ limit: 8, sort: '-createdAt' });
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    // Prevent multiple clicks
    if (addingToCart[product._id]) return;
    
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    
    try {
      // Pass full product details for guest cart support
      await addToCart(product._id, 1, {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
      });
      
      alert('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-[#0F2252] mb-4">Featured Products</h2>
            <div className="w-24 h-1 bg-[#0F2252] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-[#0F2252] mb-4">Featured Products</h2>
          <div className="w-24 h-1 bg-[#0F2252] mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
              <Link href={`/product/${product._id}`}>
                <div className="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/product/${product._id}`}>
                  <h3 className="font-bold text-lg mb-2 text-[#0F2252] hover:text-[#1a3a7a] transition-colors">{product.name}</h3>
                </Link>
                <p className="text-gray-600 mb-2 text-sm line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[#0F2252] font-bold text-xl">£{product.price.toFixed(2)}</p>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#0F2252] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1a3a7a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product.stock === 0 || addingToCart[product._id]}
                  >
                    {addingToCart[product._id] ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/store"
            className="inline-block bg-[#0F2252] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1a3a7a] transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}