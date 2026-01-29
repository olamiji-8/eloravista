// app/admin/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { productsAPI } from '@/lib/api/products';
import { ordersAPI } from '@/lib/api/orders';
import { usersAPI } from '@/lib/api/users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData, usersData] = await Promise.all([
        productsAPI.getProducts({ limit: 100 }),
        ordersAPI.getAllOrders(),
        usersAPI.getAllUsers(),
      ]);

      setProducts(productsData.data);
      setOrders(ordersData.data);
      setUsers(usersData.data);

      // Calculate stats
      const totalRevenue = ordersData.data.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      setStats({
        totalProducts: productsData.data.length,
        totalOrders: ordersData.data.length,
        totalUsers: usersData.data.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(id);
        alert('Product deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(id);
        alert('User deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      alert('Order status updated!');
      fetchData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
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

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-24 pb-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Stats Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#2563eb]" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Products</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-900">£{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="bg-[#2563eb] text-white px-6 py-4 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Product
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-green-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Manage Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="bg-purple-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Manage Users
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 font-semibold whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-4 font-semibold whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Products ({stats.totalProducts})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-6 py-4 font-semibold whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Orders ({stats.totalOrders})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-4 font-semibold whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Users ({stats.totalUsers})
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              {activeTab !== 'overview' && (
                <div className="mb-6 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  {activeTab === 'products' && (
                    <Link
                      href="/admin/products/new"
                      className="bg-[#2563eb] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="w-5 h-5" />
                      Add Product
                    </Link>
                  )}
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              {product.images?.[0]?.url ? (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{product.name}</td>
                          <td className="py-3 px-4">{product.category || 'N/A'}</td>
                          <td className="py-3 px-4">£{product.price.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              product.stock > 10 ? 'bg-green-100 text-green-800' : 
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Link
                                href={`/product/${product._id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                              <Link
                                href={`/admin/products/edit/${product._id}`}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Edit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">
                            Customer: {order.user?.name || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm mb-1">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-900 font-semibold">
                            Total: £{order.totalPrice?.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <Link
                            href={`/orders/${order._id}`}
                            className="bg-[#2563eb] text-white px-4 py-2 rounded-lg text-center hover:bg-[#1d4ed8] transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No orders found
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Verified</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.isVerified ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={user.role === 'admin'}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}