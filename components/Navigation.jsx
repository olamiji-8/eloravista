// components/Navigation.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#233e89] shadow-lg' : 'bg-[#233e89]'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/Elora-Vista-Logo.png" 
              alt="EloraVista Logo" 
              width={200}
              height={100}
              className="object-contain brightness-0 invert"
              priority
            />
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white hover:text-gray-200 transition-colors font-medium">
              HOME
            </Link>
            <Link href="/about" className="text-white hover:text-gray-200 transition-colors font-medium">
              ABOUT
            </Link>
            
            {/* Shop Dropdown */}
            <div className="relative group">
              <button className="text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-1">
                SHOP
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-lg overflow-hidden">
                <Link href="/fashion" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  FASHION & BEAUTY
                </Link>
                <Link href="/preorder" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  PRE-ORDER
                </Link>
                <Link href="/home-baby" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  HOME
                </Link>
              </div>
            </div>
            
            <Link href="/contact" className="text-white hover:text-gray-200 transition-colors font-medium">
              CONTACT US
            </Link>
          </div>

          {/* Cart Section & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <Link href="/store" className="text-white font-medium hidden lg:block hover:text-gray-200 transition-colors cursor-pointer">
              STORE
            </Link>
            <div className="relative">
              <Link href="/cart" className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
              </Link>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems || 0}
              </span>
            </div>
            <span className="text-white text-xl font-bold hidden sm:block">£{totalPrice?.toFixed(2) || '0.00'}</span>
            
            {/* Profile Dropdown */}
            <div className="relative group hidden sm:block">
              <button className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <User className="w-6 h-6" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-lg overflow-hidden">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      Wishlist
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white hover:text-gray-200 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 top-[72px] bg-[#233e89] transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col p-6 space-y-4">
          <Link 
            href="/" 
            className="text-white hover:text-gray-200 transition-colors font-medium text-lg py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            HOME
          </Link>
          
          <Link 
            href="/about" 
            className="text-white hover:text-gray-200 transition-colors font-medium text-lg py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            ABOUT
          </Link>
          
          {/* Mobile Shop Dropdown */}
          <div>
            <button 
              className="text-white hover:text-gray-200 transition-colors font-medium text-lg py-2 flex items-center justify-between w-full"
              onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
            >
              SHOP
              <svg 
                className={`w-4 h-4 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {shopDropdownOpen && (
              <div className="ml-4 mt-2 space-y-2">
                <Link 
                  href="/fashion" 
                  className="block text-white hover:text-gray-200 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FASHION & BEAUTY
                </Link>
                <Link 
                  href="/preorder" 
                  className="block text-white hover:text-gray-200 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  PRE-ORDER
                </Link>
                <Link 
                  href="/home-baby" 
                  className="block text-white hover:text-gray-200 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  HOME
                </Link>
              </div>
            )}
          </div>
          
          <Link 
            href="/contact" 
            className="text-white hover:text-gray-200 transition-colors font-medium text-lg py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            CONTACT US
          </Link>

          <Link 
            href="/store" 
            className="text-white hover:text-gray-200 transition-colors font-medium text-lg py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            STORE
          </Link>

          {/* Mobile Profile Section */}
          <div className="pt-4 border-t border-white border-opacity-20">
            {isAuthenticated ? (
              <>
                <p className="text-white font-semibold mb-2">{user?.name}</p>
                <Link 
                  href="/profile"
                  className="block text-white hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link 
                  href="/orders"
                  className="block text-white hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link 
                  href="/wishlist"
                  className="block text-white hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="block text-white hover:text-gray-200 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block text-red-300 hover:text-red-100 transition-colors py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="block text-white hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="block text-white hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Cart Info */}
          <div className="pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between text-white">
              <span className="font-medium">Cart ({totalItems || 0} items)</span>
              <span className="text-xl font-bold">£{totalPrice?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;