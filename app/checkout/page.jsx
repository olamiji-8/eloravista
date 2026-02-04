'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { paymentAPI } from '@/lib/api/payment';
import { ordersAPI } from '@/lib/api/orders';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Common countries list with ISO codes
const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CheckoutPage() {
  return (
    <>
      <Navigation />
      <CheckoutWrapper />
      <Footer />
    </>
  );
}

function CheckoutWrapper() {
  const { user, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: 'NG', // Default to Nigeria ISO code
    zipCode: '',
    phone: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart && cart.items?.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Calculate prices
  const itemsPrice = cart?.totalPrice || 0;
  const shippingPrice = 0;
  const taxPrice = 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Create payment intent when moving to step 2
  const createPaymentIntent = async () => {
    try {
      const response = await paymentAPI.createStripePayment(totalPrice, 'gbp');
      setClientSecret(response.clientSecret);
      setStep(2);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  if (!cart || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233e89]"></div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#233e89',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num
                      ? 'bg-[#233e89] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {num}
                </div>
                {num < 2 && (
                  <div
                    className={`w-24 h-1 ${
                      step > num ? 'bg-[#233e89]' : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-32 text-sm">
            <span className={step >= 1 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>
              Shipping
            </span>
            <span className={step >= 2 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>
              Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <ShippingForm
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  onContinue={createPaymentIntent}
                />
              )}

              {/* Step 2: Payment */}
              {step === 2 && clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm
                    shippingAddress={shippingAddress}
                    cart={cart}
                    user={user}
                    totalPrice={totalPrice}
                    taxPrice={taxPrice}
                    shippingPrice={shippingPrice}
                    onBack={() => setStep(1)}
                  />
                </Elements>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <OrderSummary cart={cart} itemsPrice={itemsPrice} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}

function ShippingForm({ shippingAddress, setShippingAddress, onContinue }) {
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validateAndContinue = (e) => {
    e.preventDefault();
    const { street, city, state, country, zipCode, phone } = shippingAddress;
    if (!street || !city || !state || !country || !zipCode || !phone) {
      setError('Please fill in all shipping address fields');
      return;
    }
    setError('');
    onContinue();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Shipping Address</h2>
      <form onSubmit={validateAndContinue} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Street Address
          </label>
          <input
            type="text"
            name="street"
            value={shippingAddress.street}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent text-gray-900"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={shippingAddress.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              State/Province
            </label>
            <input
              type="text"
              name="state"
              value={shippingAddress.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent text-gray-900"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Country</label>
            <select
              name="country"
              value={shippingAddress.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent text-gray-900"
              required
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={shippingAddress.zipCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent text-gray-900"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={shippingAddress.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent text-gray-900"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}

function CheckoutForm({ shippingAddress, cart, user, totalPrice, taxPrice, shippingPrice, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Don't send billing address - let Stripe collect it if needed
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        throw new Error(submitError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order
        await createOrder({
          id: paymentIntent.id,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: user?.email,
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const createOrder = async (paymentResult) => {
    try {
      const orderData = {
        orderItems: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod: 'Stripe',
        paymentResult,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const response = await ordersAPI.createOrder(orderData);
      await clearCart();
      router.push(`/orders/${response.data._id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setError('Payment successful but order creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Complete Payment</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <PaymentElement 
            options={{
              // Let Stripe handle billing details collection
              // Don't pre-fill to avoid country code issues
              fields: {
                billingDetails: 'auto'
              }
            }}
          />
          <p className="text-sm text-gray-600 mt-2">
            Choose your preferred payment method. Your information is secure and encrypted.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || !stripe}
            className="flex-1 bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay £${totalPrice.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrderSummary({ cart, itemsPrice, totalPrice }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>

        <div className="space-y-4 mb-6">
          {cart?.items?.map((item) => (
            <div key={item.product._id} className="flex gap-4">
              <img
                src={item.product.images?.[0]?.url || '/placeholder.png'}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">{item.product.name}</h4>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  £{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">£{itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-[#233e89]">£{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}