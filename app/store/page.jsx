// app/store/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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
);

export default function StorePage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Simulate loading products
  useEffect(() => {
    setTimeout(() => {
      setProducts([
        { id: 1, name: "Fashion Item 1", price: "£49.99", category: "Fashion", image: "/product1.jpg" },
        { id: 2, name: "Accessory Item 1", price: "£24.99", category: "Accessories", image: "/product2.jpg" },
        { id: 3, name: "Drinkware Item 1", price: "£14.99", category: "Drinkware", image: "/product3.jpg" },
        { id: 4, name: "Home & Baby Item 1", price: "£34.99", category: "Home & Baby", image: "/product4.jpg" },
        { id: 5, name: "Fashion Item 2", price: "£59.99", category: "Fashion", image: "/product5.jpg" },
        { id: 6, name: "Accessory Item 2", price: "£29.99", category: "Accessories", image: "/product6.jpg" },
        { id: 7, name: "Drinkware Item 2", price: "£19.99", category: "Drinkware", image: "/product7.jpg" },
        { id: 8, name: "Home & Baby Item 2", price: "£44.99", category: "Home & Baby", image: "/product8.jpg" },
        { id: 9, name: "Fashion Item 3", price: "£39.99", category: "Fashion", image: "/product9.jpg" },
        { id: 10, name: "Accessory Item 3", price: "£19.99", category: "Accessories", image: "/product10.jpg" },
        { id: 11, name: "Drinkware Item 3", price: "£12.99", category: "Drinkware", image: "/product11.jpg" },
        { id: 12, name: "Home & Baby Item 3", price: "£29.99", category: "Home & Baby", image: "/product12.jpg" },
      ]);
      setLoading(false);
    }, 2000); // 2 second loading simulation
  }, []);

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#233e89] via-[#233e89] to-[#233e89] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-white space-y-4">
            <h1 className="text-6xl font-bold">Store</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover our complete collection. Premium quality products from trusted global markets, all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-[#ecfeff] py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter/Sort Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <p className="text-gray-600 text-lg">
              {loading ? (
                <span className="inline-block w-32 h-6 bg-gray-300 rounded animate-pulse"></span>
              ) : (
                <>Showing <span className="font-bold">{products.length}</span> products</>
              )}
            </p>
            <div className="flex gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer">
                <option>All Categories</option>
                <option>Fashion</option>
                <option>Accessories</option>
                <option>Drinkware</option>
                <option>Home & Baby</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 12 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : (
              // Show actual products when loaded
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-72 bg-gray-200 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-sm">{product.category}</span>
                    </div>
                    <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">Premium quality {product.category.toLowerCase()}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[#2563eb] font-bold text-xl">{product.price}</p>
                      <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1d4ed8] transition-colors cursor-pointer">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                Previous
              </button>
              <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-bold cursor-pointer">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingCart />
    </>
  );
}