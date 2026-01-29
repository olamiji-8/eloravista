import type { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import './globals.css';

export const metadata = {
  title: 'EloraVista - Global Lifestyle & Trading Brand',
  description: 'Sourcing and delivering high-quality products from trusted international markets',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}