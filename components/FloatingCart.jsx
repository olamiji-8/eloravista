import React from 'react';
import { ShoppingCart } from 'lucide-react';

const FloatingCart = () => {
  return (
    <button className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all hover:scale-110">
      <ShoppingCart className="w-7 h-7" />
      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        0
      </span>
    </button>
  );
};

export default FloatingCart;