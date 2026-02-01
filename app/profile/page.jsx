// app/profile/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Heart, ShoppingBag, Lock, Edit2, Save, X } from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { ordersAPI } from '@/lib/api/orders';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'orders'
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getProfile();
      setProfile(data.data);
      // Populate form data
      setFormData({
        name: data.data.name || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        address: {
          street: data.data.address?.street || '',
          city: data.data.address?.city || '',
          state: data.data.address?.state || '',
          country: data.data.address?.country || '',
          zipCode: data.data.address?.zipCode || '',
        },
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getMyOrders();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await usersAPI.updateProfile(formData);
      await fetchProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: {
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        country: profile.address?.country || '',
        zipCode: profile.address?.zipCode || '',
      },
    });
    setEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'shipped':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
                <div className="h-32 bg-gray-300 rounded"></div>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile and view your orders</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-[#233e89] rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{profile?.name}</h3>
                  <p className="text-sm text-gray-600">{profile?.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-[#233e89] text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-[#233e89] text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Orders</span>
                  </button>

                  <Link
                    href="/wishlist"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Wishlist</span>
                  </Link>

                  <Link
                    href="/change-password"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Change Password</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#233e89] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-[#233e89] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Full Name
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                              <User className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-900">{profile?.name || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Email Address
                          </label>
                          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900">{profile?.email}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Phone Number
                          </label>
                          {editing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                              <Phone className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-900">{profile?.phone || 'Not provided'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Street Address
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                              <MapPin className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-900">{profile?.address?.street || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            City
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                              <span className="text-gray-900">{profile?.address?.city || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            State/Province
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="address.state"
                              value={formData.address.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                              <span className="text-gray-900">{profile?.address?.state || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Country
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="address.country"
                              value={formData.address.country}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                              <span className="text-gray-900">{profile?.address?.country || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Postal Code
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="address.zipCode"
                              value={formData.address.zipCode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                            />
                          ) : (
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                              <span className="text-gray-900">{profile?.address?.zipCode || 'Not provided'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-6">You have not placed any orders yet</p>
                      <Link
                        href="/store"
                        className="inline-block bg-[#233e89] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-600">Items:</span>
                              <span className="font-semibold text-gray-900">{order.orderItems?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-bold text-[#233e89] text-lg">
                                £{order.totalPrice?.toFixed(2)}
                              </span>
                            </div>
                            <Link
                              href={`/orders/${order._id}`}
                              className="block w-full text-center bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
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