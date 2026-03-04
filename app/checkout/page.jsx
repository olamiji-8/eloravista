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
  // step 1 = contact info, step 2 = shipping, step 3 = payment
  const [step, setStep] = useState(1);
  const [contactInfo, setContactInfo] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
  }));
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', country: 'NG', zipCode: '', phone: '',
  });

  // Redirect if cart empty
  useEffect(() => {
    if (!authLoading && cart && cart.items?.length === 0) {
      router.push('/cart');
    }
  }, [authLoading, cart, router]);

  if (authLoading || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233e89]"></div>
      </div>
    );
  }

  const itemsPrice = cart?.totalPrice || 0;
  const totalPrice = itemsPrice;

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
            {[1, 2, 3].map((num, idx, arr) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-[#233e89] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                {idx < arr.length - 1 && (
                  <div className={`w-24 h-1 ${step > num ? 'bg-[#233e89]' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm gap-16">
            <span className={step === 1 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>Contact</span>
            <span className={step === 2 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>Shipping</span>
            <span className={step === 3 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">

              {/* Step 1: Contact Info */}
              {step === 1 && (
                <ContactForm
                  contactInfo={contactInfo}
                  setContactInfo={setContactInfo}
                  onContinue={() => setStep(2)}
                />
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <ShippingForm
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  onContinue={createPaymentIntent}
                  onBack={() => setStep(1)}
                />
              )}

              {/* Step 3: Payment */}
              {step === 3 && clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm
                    shippingAddress={shippingAddress}
                    cart={cart}
                    contactInfo={contactInfo}
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

function ContactForm({ contactInfo, setContactInfo, onContinue }) {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactInfo.name.trim() || !contactInfo.email.trim()) {
      setError('Please fill in your full name and email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    onContinue();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Contact Information</h2>
      <p className="text-gray-500 text-sm mb-6">Your order confirmation will be sent to this email.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name *"
          value={contactInfo.name}
          onChange={e => setContactInfo(p => ({ ...p, name: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
          required
        />
        <input
          type="email"
          placeholder="Email Address *"
          value={contactInfo.email}
          onChange={e => setContactInfo(p => ({ ...p, email: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] text-gray-900"
          required
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition"
        >
          Continue to Shipping →
        </button>
      </form>
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
          <button type="button" onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
            ← Back
          </button>
          <button type="submit"
            className="flex-1 bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition">
            Continue to Payment →
          </button>
        </div>
      </form>
    </div>
  );
}

function CheckoutForm({ shippingAddress, cart, contactInfo, totalPrice, taxPrice, shippingPrice, onBack }) {
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
          email_address: contactInfo.email,
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
        guestName: contactInfo.name,
        guestEmail: contactInfo.email,
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
      <p className="text-sm text-gray-500 mb-4">
        Order confirmation will be sent to <strong>{contactInfo.email}</strong>
      </p>
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