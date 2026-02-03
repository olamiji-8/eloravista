import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white">

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
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