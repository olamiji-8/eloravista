import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#account" className="text-gray-600 hover:text-blue-600 transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="#cart" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Cart
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Shop Categories</h3>
            <ul className="space-y-3">
              <li>
                <a href="#fashion" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Fashion
                </a>
              </li>
              <li>
                <a href="#accessories" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Accessories
                </a>
              </li>
              <li>
                <a href="#drinkware" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Drinkware
                </a>
              </li>
              <li>
                <a href="#home-baby" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home and Baby
                </a>
              </li>
              <li>
                <a href="#general" className="text-gray-600 hover:text-blue-600 transition-colors">
                  General
                </a>
              </li>
            </ul>
          </div>

          {/* Our App */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Our App</h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="font-bold text-gray-900">ELORA VISTA</span>
            </div>
            <a href="#" className="inline-block">
              <img 
                src="/google-play-badge.png" 
                alt="Get it on Google Play" 
                className="h-12"
              />
              {/* If you don't have the image, use this div instead: */}
              <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div>
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600">
              Copyright © 2026 EloraVista
            </p>
            <p className="text-gray-600">
              Powered by olapelu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;