// components/FloatingCart.jsx
'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';

const FloatingCart = () => {
  const { totalItems } = useCart();
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push('/cart')}
      className="fixed bottom-8 right-8 z-50 bg-[#2563eb] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-[#1d4ed8] transition-all hover:scale-110 cursor-pointer"
    >
      <ShoppingCart className="w-7 h-7" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#10b981] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default FloatingCart;