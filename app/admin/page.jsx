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
  Mail,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { productsAPI } from '@/lib/api/products';
import { ordersAPI } from '@/lib/api/orders';
import { usersAPI } from '@/lib/api/users';
import { contactAPI } from '@/lib/api/contact';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalContacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
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
      const [productsData, ordersData, usersData, contactsData] = await Promise.all([
        productsAPI.getProducts({ limit: 100 }),
        ordersAPI.getAllOrders(),
        usersAPI.getAllUsers(),
        contactAPI.getAllContacts(),
      ]);

      setProducts(productsData.data);
      setOrders(ordersData.data);
      setUsers(usersData.data);
      setContacts(contactsData.data);

      // Calculate stats
      const totalRevenue = ordersData.data.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      setStats({
        totalProducts: productsData.data.length,
        totalOrders: ordersData.data.length,
        totalUsers: usersData.data.length,
        totalRevenue,
        totalContacts: contactsData.data.length,
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

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Contact Messages</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="bg-orange-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    View Messages
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
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-6 py-4 font-semibold whitespace-nowrap ${
                    activeTab === 'contacts'
                      ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Contact Messages ({stats.totalContacts})
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              {activeTab !== 'overview' && (
                <div className="mb-6 flex gap-4 text-black">
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
                          <td className="py-3 px-4 font-medium text-black">{product.name}</td>
                          <td className="py-3 px-4 text-black">{product.category || 'N/A'}</td>
                          <td className="py-3 px-4 text-black">£{product.price.toFixed(2)}</td>
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
                  {filteredOrders.map((order) => {
                    // Determine if it's a guest order
                    const isGuest = !order.user?.name && (order.guestName || order.guestEmail);
                    const customerName = order.user?.name || order.guestName || 'Guest';
                    const customerEmail = order.user?.email || order.guestEmail || 'N/A';

                    return (
                      <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow text-black">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-gray-600 text-sm">
                                Customer: {customerName}
                              </p>
                              {isGuest && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                  Guest
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">
                              Email: {customerEmail}
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
                    );
                  })}
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
                          <td className="py-3 px-4 font-medium text-black">{user.name}</td>
                          <td className="py-3 px-4 text-black">{user.email}</td>
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

              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div 
                        key={contact._id} 
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white cursor-pointer"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{contact.name}</h3>
                                <p className="text-sm text-gray-600">{contact.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <p className="font-semibold text-gray-900">{contact.subject}</p>
                            </div>
                            
                            <p className="text-gray-700 mb-4 line-clamp-2">{contact.message}</p>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(contact.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContact(contact);
                            }}
                            className="text-[#2563eb] hover:text-[#1d4ed8] font-semibold text-sm whitespace-nowrap"
                          >
                            View Full Message
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-semibold mb-2">No contact messages yet</p>
                      <p>Messages from customers will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Contact Message Details</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedContact.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <p className="p-4 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                  {selectedContact.subject}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Received</label>
                <p className="text-gray-600">
                  {new Date(selectedContact.createdAt).toLocaleString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="flex-1 bg-[#2563eb] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors text-center"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}