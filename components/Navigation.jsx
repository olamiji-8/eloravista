// components/Navigation.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, []);

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
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-lg overflow-hidden">
                <Link href="/fashion" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  FASHION
                </Link>
                <Link href="/accessories" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  ACCESSORIES
                </Link>
                <Link href="/drinkware" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  DRINKWARE
                </Link>
                <Link href="/home-baby" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  HOME AND BABY
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
              <button className="text-white hover:text-gray-200 transition-colors cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
              </button>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                0
              </span>
            </div>
            <span className="text-white text-xl font-bold hidden sm:block">£0.00</span>
            <button className="text-white hover:text-gray-200 transition-colors hidden sm:block cursor-pointer">
              <User className="w-6 h-6" />
            </button>

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
                  FASHION
                </Link>
                <Link 
                  href="/accessories" 
                  className="block text-white hover:text-gray-200 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ACCESSORIES
                </Link>
                <Link 
                  href="/drinkware" 
                  className="block text-white hover:text-gray-200 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DRINKWARE
                </Link>
                <Link 
                  href="/home-baby" 
                  className="block text-white hover:text-gray-200 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  HOME AND BABY
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

          {/* Mobile Cart Info */}
          <div className="pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between text-white">
              <span className="font-medium">Cart Total:</span>
              <span className="text-xl font-bold">£0.00</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;