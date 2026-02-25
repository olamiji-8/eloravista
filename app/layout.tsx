// app/layout.tsx
import type { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import HealthPing from '@/components/HealthPing';
import './globals.css';

export const metadata = {
  title: 'EloraVista - Global Lifestyle & Trading Brand',
  description: 'Sourcing and delivering high-quality products from trusted international markets',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/*
        suppressHydrationWarning on <body> prevents the React hydration error
        caused by browser extensions like Grammarly adding data attributes
        (data-gr-ext-installed, data-new-gr-c-s-check-loaded) to the body tag.
        This is safe — it only suppresses warnings for the body element itself.
      */}
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <HealthPing />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}