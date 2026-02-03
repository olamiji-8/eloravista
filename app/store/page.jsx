// app/store/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import { productsAPI } from '@/lib/api/products';
import { wishlistAPI } from '@/lib/api/wishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-40 sm:h-52 lg:h-72 bg-gray-300"></div>
    <div className="p-2 sm:p-3 lg:p-5">
      <div className="h-4 sm:h-6 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4 mb-2 sm:mb-4 hidden sm:block"></div>
      <div className="flex items-center justify-between">
        <div className="h-5 sm:h-6 bg-gray-300 rounded w-16 sm:w-20"></div>
        <div className="h-7 sm:h-10 bg-gray-300 rounded w-20 sm:w-28"></div>
      </div>
    </div>
  </div>
);

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);
  const [togglingWishlist, setTogglingWishlist] = useState({});
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [category, sort, page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort,
      };
      
      if (category !== 'All Categories') {
        params.category = category;
      }

      const data = await productsAPI.getProducts(params);
      setProducts(data.data);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await wishlistAPI.getWishlist();
      const productIds = data.data?.products?.map(p => p._id) || [];
      setWishlistItems(productIds);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlistItems([]);
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
      
      // Success feedback
      alert('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleToggleWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }

    if (togglingWishlist[productId]) return;

    setTogglingWishlist(prev => ({ ...prev, [productId]: true }));

    try {
      const isInWishlist = wishlistItems.includes(productId);
      
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
      } else {
        await wishlistAPI.addToWishlist(productId);
        setWishlistItems(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      alert('Failed to update wishlist');
    } finally {
      setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#233e89] to-[#1a3a7a] pt-32 pb-20">
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
      <section className="bg-white py-20">
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
              <select 
                className="px-4 py-2 bg-[#233e89] text-white border border-[#233e89] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7a] cursor-pointer"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option>All Categories</option>
                <option>Fashion</option>
                <option>Accessories</option>
                <option>Drinkware</option>
                <option>Home & Baby</option>
              </select>
              <select 
                className="px-4 py-2 bg-[#233e89] text-white border border-[#233e89] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7a] cursor-pointer"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="-createdAt">Sort by: Featured</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-createdAt">Newest</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-8">
            {loading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : products.length > 0 ? (
              products.map((product) => {
                const isInWishlist = wishlistItems.includes(product._id);
                
                return (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                    <Link href={`/product/${product._id}`}>
                      <div className="relative h-40 sm:h-52 lg:h-72 bg-gray-200 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-sm">{product.category}</span>
                          </div>
                        )}
                        {/* Sale Badge */}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="absolute bottom-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                            Sale
                          </span>
                        )}
                        <button 
                          onClick={(e) => handleToggleWishlist(product._id, e)}
                          disabled={togglingWishlist[product._id]}
                          className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white p-1.5 lg:p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <svg 
                            className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors ${
                              isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-900'
                            }`}
                            fill={isInWishlist ? 'currentColor' : 'none'}
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                            />
                          </svg>
                        </button>
                      </div>
                    </Link>
                    <div className="p-2 sm:p-3 lg:p-5">
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-[#233e89] hover:text-[#1a3a7a] transition-colors truncate">{product.name}</h3>
                      </Link>
                      <p className="text-gray-600 mb-1 sm:mb-3 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 hidden sm:block">{product.description}</p>
                      
                      {/* Colors Display - hidden on mobile */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="mb-3 hidden sm:block">
                          <p className="text-xs text-gray-500 mb-1">Available Colors:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.colors.slice(0, 4).map((color, index) => (
                              <span 
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {color}
                              </span>
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{product.colors.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-gray-400 line-through text-xs sm:text-sm">£{product.originalPrice.toFixed(2)}</span>
                          )}
                          <p className="text-[#233e89] font-bold text-base sm:text-xl">£{product.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-[#233e89] text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#1a3a7a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={product.stock === 0 || addingToCart[product._id]}
                        >
                          {addingToCart[product._id] ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-600 text-xl">No products found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#233e89] text-white rounded-lg hover:bg-[#1a3a7a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button 
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                    page === pageNum 
                      ? 'bg-[#233e89] text-white' 
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#233e89] text-white rounded-lg hover:bg-[#1a3a7a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Shop With Us Section */}
      <section className="bg-[#233e89] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">Why Shop With EloraVista?</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Global Sourcing</h3>
              <p className="text-white/80 leading-relaxed">
                Products sourced directly from trusted markets worldwide
              </p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Quality Assured</h3>
              <p className="text-white/80 leading-relaxed">
                Every product is carefully inspected for quality standards
              </p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Best Value</h3>
              <p className="text-white/80 leading-relaxed">
                Competitive prices without compromising on quality
              </p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Fast Delivery</h3>
              <p className="text-white/80 leading-relaxed">
                Quick and reliable shipping to your doorstep
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