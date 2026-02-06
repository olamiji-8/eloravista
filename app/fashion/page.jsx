// app/fashion/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import { productsAPI } from '@/lib/api/products';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';

export default function FashionPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('-createdAt');
  const [activeFilter, setActiveFilter] = useState('All');
  const { addToCart } = useCart();

  const filterCategories = [
    { name: 'All', value: 'All', icon: '🛍️' },
    { name: 'Bags', value: 'Bags', icon: '👜' },
    { name: 'Accessories', value: 'Accessories', icon: '👓' },
    { name: 'Perfumes', value: 'Perfumes', icon: '🌸' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [sort, activeFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        sort,
        limit: 50,
      };
      
      // If "All" is selected, fetch all Fashion & Beauty related items
      // Otherwise, filter by the specific subcategory
      if (activeFilter === 'All') {
        params.category = 'Fashion';
      } else {
        params.subcategory = activeFilter;
      }
      
      const data = await productsAPI.getProducts(params);
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Added to cart!');
    } catch (error) {
      alert('Please login to add items to cart');
    }
  };

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#233e89] to-[#1a3a7a] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-white space-y-4">
            <h1 className="text-6xl font-bold">Fashion & Beauty</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Exclusive Fashion & Beauty deals for a Limited Time. Discover premium quality bags, accessories, and perfumes from trusted global markets.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs Section */}
      <section className="bg-white border-b sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-4 scrollbar-hide">
            {filterCategories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveFilter(category.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                  activeFilter === category.value
                    ? 'bg-[#233e89] text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter/Sort Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeFilter === 'All' ? 'All Products' : activeFilter}
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                Showing <span className="font-bold">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="flex gap-4">
              <select 
                className="px-4 py-2 bg-[#233e89] text-white border border-[#233e89] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7a] cursor-pointer"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="-createdAt">Sort by: Featured</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-createdAt">Newest</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-72 bg-gray-300"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-300 rounded w-20"></div>
                      <div className="h-10 bg-gray-300 rounded w-28"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                  <Link href={`/product/${product._id}`}>
                    <div className="relative h-72 bg-gray-200 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Product Image
                        </div>
                      )}
                      {product.subcategory && (
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#233e89]">
                          {product.subcategory}
                        </span>
                      )}
                      <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/product/${product._id}`}>
                      <h3 className="font-bold text-lg mb-2 text-[#233e89] hover:text-[#1a3a7a] transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[#233e89] font-bold text-xl">£{product.price.toFixed(2)}</p>
                      <button 
                        onClick={() => handleAddToCart(product._id)}
                        className="bg-[#233e89] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1a3a7a] transition-colors cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {activeFilter === 'All' 
                      ? 'No products available in Fashion & Beauty category'
                      : `No products found in ${activeFilter} category`
                    }
                  </p>
                  {activeFilter !== 'All' && (
                    <button
                      onClick={() => setActiveFilter('All')}
                      className="bg-[#233e89] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1a3a7a] transition-colors"
                    >
                      View All Products
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination - Show only if there are products */}
          {products.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="px-4 py-2 bg-[#233e89] text-white rounded-lg hover:bg-[#1a3a7a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 bg-[#233e89] text-white rounded-lg font-bold cursor-pointer">1</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer">2</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer">3</button>
              <button className="px-4 py-2 bg-[#233e89] text-white rounded-lg hover:bg-[#1a3a7a] transition-colors cursor-pointer">
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-[#233e89] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">Why Choose EloraVista Fashion & Beauty?</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Quality</h3>
              <p className="text-white/80 leading-relaxed">
                Every fashion and beauty item is carefully selected from trusted international suppliers to ensure the highest quality standards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Best Prices</h3>
              <p className="text-white/80 leading-relaxed">
                Direct sourcing from global markets means you get premium fashion and beauty products at unbeatable prices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure Shopping</h3>
              <p className="text-white/80 leading-relaxed">
                Shop with confidence with our secure payment system and hassle-free return policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCart />
    </>
  );
}