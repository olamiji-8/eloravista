// app/cart/page.jsx
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

  const handleCheckout = () => {
    router.push('/checkout');
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          {/* Guest Notice */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Shopping as a guest?</strong> Your cart is saved locally. 
                <Link href="/login?redirect=/checkout" className="underline ml-1 font-semibold">
                  Login
                </Link> or 
                <Link href="/register?redirect=/checkout" className="underline ml-1 font-semibold">
                  create an account
                </Link> to sync your cart — or just{' '}
                <button
                  onClick={handleCheckout}
                  className="underline font-semibold text-blue-900"
                >
                  continue as guest
                </button>.
              </p>
            </div>
          )}
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                {cart.items.map((item) => {
                  // Guard: skip items where product is null/undefined
                  if (!item || !item.product) return null;

                  return (
                    <div key={item.product._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0].url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-black text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>
                        <p className="text-[#233e89] font-bold text-xl">£{(item.price || 0).toFixed(2)}</p>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between">
                        <button 
                          onClick={() => handleRemove(item.product._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2 bg-[#233e89] rounded-lg p-1 text-white">
                          <button 
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}
                            className="p-1 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}
                            className="p-1 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span className="text-[#233e89]">£{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Proceed to Checkout (works for both guest and logged in) */}
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#233e89] text-white py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>

                {/* Guest option */}
                {!isAuthenticated && (
                  <div className="space-y-2">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-gray-300 w-full"></div>
                      <span className="bg-white px-3 text-sm text-gray-500 absolute">or</span>
                    </div>
                    <Link
                      href="/login?redirect=/checkout"
                      className="block text-center border-2 border-[#233e89] text-[#233e89] py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                    >
                      Login & Checkout
                    </Link>
                  </div>
                )}
                
                <Link 
                  href="/store"
                  className="block text-center text-[#233e89] hover:text-[#1d4ed8] font-semibold mt-3"
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