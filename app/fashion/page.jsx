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

  // Icon components for better visual consistency
  const AllIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  );

  const BagIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  );

  const AccessoriesIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const PerfumeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 01.5.866v7a1 1 0 01-1 1h-9a1 1 0 01-1-1v-7a1 1 0 01.5-.866l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  );

  const filterCategories = [
    { name: 'All', value: 'All', Icon: AllIcon },
    { name: 'Bags', value: 'Bags', Icon: BagIcon },
    { name: 'Accessories', value: 'Accessories', Icon: AccessoriesIcon },
    { name: 'Perfumes', value: 'Perfumes', Icon: PerfumeIcon },
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-center">
            <select 
              className="px-4 py-2 bg-[#233e89] text-white border border-[#233e89] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7a] cursor-pointer"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              {filterCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.name}
                </option>
              ))}
            </select>
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
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#233e89] flex items-center gap-1">
                          {product.subcategory === 'Bags' && <BagIcon />}
                          {product.subcategory === 'Accessories' && <AccessoriesIcon />}
                          {product.subcategory === 'Perfumes' && <PerfumeIcon />}
                          <span>{product.subcategory}</span>
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