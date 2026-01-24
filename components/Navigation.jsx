'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#233e89] shadow-lg' : 'bg-[#233e89]'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10  flex items-center justify-center">
              {/* Replace this div with your logo image */}
              <img src="/Elora-Vista-Logo.png" alt="Logo" className="w-full h-full rounded-full" />
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-white hover:text-gray-200 transition-colors font-medium">
              HOME
            </a>
            <a href="#about" className="text-white hover:text-gray-200 transition-colors font-medium">
              ABOUT
            </a>
            <div className="relative group">
              <button className="text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-1">
                SHOP
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#fashion" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  FASHION
                </a>
                <a href="#accessories" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  ACCESSORIES
                </a>
                <a href="#drinkware" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  DRINKWARE
                </a>
                <a href="#home-baby" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  HOME AND BABY
                </a>
              </div>
            </div>
            <a href="#contact" className="text-white hover:text-gray-200 transition-colors font-medium">
              CONTACT US
            </a>
          </div>

          {/* Cart Section */}
          <div className="flex items-center gap-4">
            <span className="text-white font-medium hidden md:block">STORE</span>
            <div className="relative">
              <button className="text-white hover:text-gray-200 transition-colors">
                <ShoppingCart className="w-6 h-6" />
              </button>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
            <span className="text-white text-xl font-bold">£0.00</span>
            <button className="text-white hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;