// components/HealthPing.jsx
// This component silently pings the backend every 2 minutes to prevent Render sleep.
// Add <HealthPing /> inside your RootLayout or _app, it renders nothing visible.

'use client';

import { useEffect } from 'react';

const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eloravista.onrender.com/api';

export default function HealthPing() {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch(`${BACKEND_URL}/health`, {
          method: 'GET',
          // Use no-cors so even if CORS blocks the response it still sends the request
          mode: 'no-cors',
          cache: 'no-store',
        });
      } catch {
        // silently ignore - we just want to keep the server warm
      }
    };

    // Ping immediately on mount
    ping();

    // Then ping every 2 minutes
    const interval = setInterval(ping, PING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Renders nothing
  return null;
}