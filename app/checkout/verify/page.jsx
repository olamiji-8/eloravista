'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentAPI } from '@/lib/api/payment';
import { ordersAPI } from '@/lib/api/orders';
import { useCart } from '@/hooks/useCart';

// Separate component that uses useSearchParams
function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your payment...');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL
        const reference = searchParams.get('reference');
        
        if (!reference) {
          setStatus('error');
          setMessage('Payment reference not found');
          return;
        }

        // Verify payment with Paystack
        const verificationResponse = await paymentAPI.verifyPaystackPayment(reference);
        
        if (verificationResponse.data.status !== 'success') {
          setStatus('error');
          setMessage('Payment verification failed');
          return;
        }

        // Get checkout data from session storage
        const checkoutDataStr = sessionStorage.getItem('checkout_data');
        
        if (!checkoutDataStr) {
          setStatus('error');
          setMessage('Checkout data not found. Please contact support.');
          return;
        }

        const checkoutData = JSON.parse(checkoutDataStr);

        // Create order
        const orderData = {
          ...checkoutData,
          paymentMethod: 'Paystack',
          paymentResult: {
            id: verificationResponse.data.id,
            status: verificationResponse.data.status,
            update_time: new Date().toISOString(),
            email_address: verificationResponse.data.customer.email,
          },
        };

        const orderResponse = await ordersAPI.createOrder(orderData);
        
        // Clear cart and session storage
        await clearCart();
        sessionStorage.removeItem('paystack_reference');
        sessionStorage.removeItem('checkout_data');

        // Success
        setStatus('success');
        setMessage('Payment successful! Redirecting to your order...');
        setOrderId(orderResponse.data._id);

        // Redirect to order page after 2 seconds
        setTimeout(() => {
          router.push(`/orders/${orderResponse.data._id}`);
        }, 2000);

      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, clearCart, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              {orderId && (
                <button
                  onClick={() => router.push(`/orders/${orderId}`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Order
                </button>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/checkout')}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function VerificationLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaystackVerifyPage() {
  return (
    <Suspense fallback={<VerificationLoading />}>
      <VerificationContent />
    </Suspense>
  );
}