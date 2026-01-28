'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { usersAPI } from '@/lib/api/users';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      const data = await usersAPI.getProfile();
      setProfile(data.data);
      setFormData({
        name: data.data.name || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        address: data.data.address || { street: '', city: '', state: '', country: '', zipCode: '' }
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.updateProfile(formData);
      alert('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
              <div className="bg-white rounded-lg p-8">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
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
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
            {!editing && (
              <button 
                onClick={() => setEditing(true)}
                className="bg-[#2563eb] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Address</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, country: e.target.value}})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#2563eb] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="border border-gray-300 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg text-gray-900">{profile?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-lg text-gray-900">{profile?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-lg text-gray-900">{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="text-lg text-gray-900">
                    {profile?.address?.street ? (
                      <>
                        {profile.address.street}<br />
                        {profile.address.city}, {profile.address.state} {profile.address.zipCode}<br />
                        {profile.address.country}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                  <p className="text-lg text-gray-900">
                    {profile?.isVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">⚠ Not Verified</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}