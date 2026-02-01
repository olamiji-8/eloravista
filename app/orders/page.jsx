// app/orders/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Calendar, CreditCard, MapPin, ChevronRight } from 'lucide-react';
import { ordersAPI } from '@/lib/api/orders';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getMyOrders();
      setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white rounded-lg p-6">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
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

  if (orders.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center py-20">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
            <p className="text-gray-600 mb-8">Start shopping to place your first order</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>
          
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {order.orderItems?.length || 0} items
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          £{order.totalPrice?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/orders/${order._id}`}
                      className="bg-[#233e89] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2 self-start lg:self-center"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.orderItems?.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product?.images?.[0]?.url ? (
                            <img 
                              src={item.product.images[0].url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      ))}
                      {order.orderItems?.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm font-semibold">
                          +{order.orderItems.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Delivery Address</p>
                          <p>
                            {order.shippingAddress.street}, {order.shippingAddress.city}, 
                            {order.shippingAddress.state} {order.shippingAddress.zipCode}, 
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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