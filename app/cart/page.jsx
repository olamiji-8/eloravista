'use client';

import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { cart, loading, updateCartItem, removeFromCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    if (confirm('Remove this item from cart?')) {
      try {
        await removeFromCart(productId);
      } catch (error) {
        alert('Failed to remove item');
      }
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
              <div className="bg-white rounded-lg p-6">
                <div className="h-24 bg-gray-300 rounded mb-4"></div>
                <div className="h-24 bg-gray-300 rounded mb-4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Link 
              href="/store"
              className="inline-block bg-[#2563eb] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>
                      <p className="text-[#2563eb] font-bold text-xl">£{item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between">
                      <button 
                        onClick={() => handleRemove(item.product._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>£{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#2563eb]">£{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>
                
                <Link 
                  href="/store"
                  className="block text-center text-[#2563eb] hover:text-[#1d4ed8] font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}