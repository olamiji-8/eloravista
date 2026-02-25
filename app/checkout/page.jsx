// app/checkout/page.jsx
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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');
  // step 1 = account choice (guests only), 2 = shipping, 3 = payment
  const [step, setStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', country: 'NG', zipCode: '', phone: '',
  });

  // Redirect if cart empty — only after auth finishes loading
  useEffect(() => {
    if (!authLoading && cart && cart.items?.length === 0) {
      router.push('/cart');
    }
  }, [authLoading, cart, router]);

  // Show spinner while auth resolves
  if (authLoading || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233e89]"></div>
      </div>
    );
  }

  const itemsPrice = cart?.totalPrice || 0;
  const totalPrice = itemsPrice;

  // Authenticated users skip step 1 — derive the displayed step without storing it in state
  const effectiveStep = isAuthenticated && step === 1 ? 2 : step;

  const createPaymentIntent = async () => {
    try {
      const response = await paymentAPI.createStripePayment(totalPrice, 'gbp');
      setClientSecret(response.clientSecret);
      setStep(3);
    } catch {
      alert('Failed to initialize payment. Please try again.');
    }
  };

  const appearance = { theme: 'stripe', variables: { colorPrimary: '#233e89' } };
  const options = { clientSecret, appearance };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {(!isAuthenticated ? [1, 2, 3] : [2, 3]).map((num, idx, arr) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  effectiveStep >= num ? 'bg-[#233e89] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                {idx < arr.length - 1 && (
                  <div className={`w-24 h-1 ${effectiveStep > num ? 'bg-[#233e89]' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className={`flex justify-center mt-2 text-sm ${!isAuthenticated ? 'gap-16' : 'gap-32'}`}>
            {!isAuthenticated && (
              <span className={effectiveStep === 1 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>Account</span>
            )}
            <span className={effectiveStep === 2 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>Shipping</span>
            <span className={effectiveStep === 3 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">

              {/* Step 1: Account choice — only for guests */}
              {effectiveStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">How would you like to checkout?</h2>
                  <p className="text-gray-500 mb-6 text-sm">Your cart is saved — choose how to continue.</p>

                  {/* Guest option */}
                  <div className="border-2 border-[#233e89] rounded-lg p-6 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Continue as Guest</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      No account needed. We just need your name and email for your order confirmation.
                    </p>
                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={guestInfo.name}
                        onChange={e => setGuestInfo(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={guestInfo.email}
                        onChange={e => setGuestInfo(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!guestInfo.name || !guestInfo.email) {
                          alert('Please enter your name and email to continue as guest.');
                          return;
                        }
                        setStep(2);
                      }}
                      className="w-full bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition"
                    >
                      Continue as Guest →
                    </button>
                  </div>

                  {/* Login option */}
                  <div className="border border-gray-300 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Login or Create Account</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Track your orders, save your details, and checkout faster next time.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/login?redirect=/checkout"
                        className="flex-1 border-2 border-[#233e89] text-[#233e89] py-3 rounded-lg font-semibold text-center hover:bg-blue-50 transition"
                      >
                        Login
                      </a>
                      <a
                        href="/register?redirect=/checkout"
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-200 transition"
                      >
                        Register
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping */}
              {effectiveStep === 2 && (
                <ShippingForm
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  onContinue={createPaymentIntent}
                  onBack={isAuthenticated ? null : () => setStep(1)}
                />
              )}

              {/* Step 3: Payment */}
              {effectiveStep === 3 && clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm
                    shippingAddress={shippingAddress}
                    cart={cart}
                    user={isAuthenticated ? user : { name: guestInfo.name, email: guestInfo.email }}
                    isGuest={!isAuthenticated}
                    totalPrice={totalPrice}
                    taxPrice={0}
                    shippingPrice={0}
                    onBack={() => setStep(2)}
                  />
                </Elements>
              )}
            </div>
          </div>

          <OrderSummary cart={cart} itemsPrice={itemsPrice} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}

function ShippingForm({ shippingAddress, setShippingAddress, onContinue, onBack }) {
  const [error, setError] = useState('');

  const handleChange = (e) => setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });

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
        <input
          type="text" name="street" value={shippingAddress.street} onChange={handleChange}
          placeholder="Street Address *" required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text" name="city" value={shippingAddress.city} onChange={handleChange}
            placeholder="City *" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
          />
          <input
            type="text" name="state" value={shippingAddress.state} onChange={handleChange}
            placeholder="State/Province *" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            name="country" value={shippingAddress.country} onChange={handleChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <input
            type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleChange}
            placeholder="Postal Code *" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
          />
        </div>
        <input
          type="tel" name="phone" value={shippingAddress.phone} onChange={handleChange}
          placeholder="Phone Number *" required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        <div className="flex gap-3">
          {onBack && (
            <button type="button" onClick={onBack}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              ← Back
            </button>
          )}
          <button type="submit"
            className="flex-1 bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition">
            Continue to Payment →
          </button>
        </div>
      </form>
    </div>
  );
}

function CheckoutForm({ shippingAddress, cart, user, isGuest, totalPrice, taxPrice, shippingPrice, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/checkout/success` },
        redirect: 'if_required',
      });

      if (submitError) throw new Error(submitError.message);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await createOrder({
          id: paymentIntent.id,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: user?.email,
        });
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const createOrder = async (paymentResult) => {
    try {
      const orderData = {
        orderItems: cart.items
          .filter(item => item && item.product)
          .map(item => ({
            product: item.product._id,
            name: item.product.name,
            qty: item.quantity,
            price: item.price,
          })),
        shippingAddress,
        paymentMethod: 'Stripe',
        paymentResult,
        taxPrice,
        shippingPrice,
        totalPrice,
        ...(isGuest && { guestName: user.name, guestEmail: user.email }),
      };

      const response = await ordersAPI.createOrder(orderData);
      await clearCart();
      router.push(`/orders/${response.data._id}`);
    } catch {
      setError('Payment successful but order creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Complete Payment</h2>
      {isGuest && (
        <p className="text-sm text-gray-500 mb-4">
          Order confirmation will be sent to <strong>{user.email}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <PaymentElement options={{ fields: { billingDetails: 'auto' } }} />
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        <div className="flex gap-4">
          <button type="button" onClick={onBack} disabled={loading}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50">
            Back
          </button>
          <button type="submit" disabled={loading || !stripe}
            className="flex-1 bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition disabled:opacity-50">
            {loading ? 'Processing...' : `Pay £${totalPrice.toFixed(2)}`}
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
          {cart?.items?.filter(item => item && item.product).map((item) => (
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
              <p className="font-semibold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
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
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-[#233e89]">£{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}