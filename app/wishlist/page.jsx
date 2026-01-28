'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { wishlistAPI } from '@/lib/api/wishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router]);

  const fetchWishlist = async () => {
    try {
      const data = await wishlistAPI.getWishlist();
      setWishlist(data.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      fetchWishlist();
    } catch (error) {
      alert('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg p-4">
                    <div className="h-48 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Save items you love for later</p>
            <Link 
              href="/store"
              className="inline-block bg-[#2563eb] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-24 pb-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist ({wishlist.products.length} items)</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                <div className="relative h-64 bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <button 
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                  <p className="text-[#2563eb] font-bold text-xl mb-4">£{product.price.toFixed(2)}</p>
                  <button 
                    onClick={() => handleAddToCart(product._id)}
                    className="w-full bg-[#2563eb] text-white py-2 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}