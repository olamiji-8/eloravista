// app/wishlist/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistAPI } from '@/lib/api/wishlist';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
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
      setLoading(true);
      const data = await wishlistAPI.getWishlist();
      setWishlist(data.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    if (confirm('Remove this item from wishlist?')) {
      try {
        await wishlistAPI.removeFromWishlist(productId);
        await fetchWishlist();
      } catch (error) {
        alert('Failed to remove item');
      }
    }
  };

  const handleAddToCart = async (productId) => {
    if (addingToCart[productId]) return;

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      await addToCart(productId, 1);
      alert('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
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
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white rounded-lg p-4">
                    <div className="h-48 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
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
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Save your favorite items here</p>
            <Link 
              href="/store"
              className="inline-block bg-[#233e89] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors"
            >
              Continue Shopping
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">{wishlist.products.length} items</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
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
                    <h3 className="font-bold text-lg mb-2 text-gray-900 hover:text-[#233e89] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-2 text-sm line-clamp-2">{product.description}</p>
                  <p className="text-[#233e89] font-bold text-xl mb-4">£{product.price.toFixed(2)}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stock === 0 || addingToCart[product._id]}
                      className="flex-1 bg-[#233e89] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {addingToCart[product._id] ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button 
                      onClick={() => handleRemove(product._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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