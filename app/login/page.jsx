// app/login/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, loading, error, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // only redirect when provider finished initializing
  useEffect(() => {
    console.log('LoginPage: auth state', { loading, isAuthenticated }); // debug
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(formData);
      // redirect after successful login
      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#233e89] to-[#233e89] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image 
                src="/Elora-Vista-Logo.png" 
                alt="EloraVista Logo" 
                width={150}
                height={75}
                className="mx-auto"
                priority
              />
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#233e89] text-white py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Do not have an account?{' '}
            <Link href="/register" className="text-[#233e89] font-semibold hover:text-[#1d4ed8]">
              Create Account
            </Link>
          </p>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}