'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { paymentAPI } from '@/lib/api/payment';
import { ordersAPI } from '@/lib/api/orders';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  return (
    <>
      <Navigation />
      <Elements stripe={stripePromise}>
        <CheckoutContent />
      </Elements>
      <Footer />
    </>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment Method, 3: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'paystack'

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
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
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over £100
  const taxPrice = itemsPrice * 0.2; // 20% VAT
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Handle shipping form change
  const handleShippingChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  // Validate shipping address
  const validateShipping = () => {
    const { street, city, state, country, zipCode, phone } = shippingAddress;
    if (!street || !city || !state || !country || !zipCode || !phone) {
      setError('Please fill in all shipping address fields');
      return false;
    }
    return true;
  };

  // Handle Stripe Payment
  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const paymentIntentResponse = await paymentAPI.createStripePayment(totalPrice, 'gbp');
      const { clientSecret, paymentIntentId } = paymentIntentResponse;

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.name,
              email: user?.email,
              phone: shippingAddress.phone,
              address: {
                line1: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                country: shippingAddress.country,
                postal_code: shippingAddress.zipCode,
              },
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Create order
        await createOrder({
          id: paymentIntentId,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: user?.email,
        });
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle Paystack Payment
  const handlePaystackPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Initialize Paystack payment
      const response = await paymentAPI.initializePaystackPayment(
        totalPrice,
        user?.email
      );

      const { authorization_url, reference } = response.data;

      // Store reference in session storage for verification
      sessionStorage.setItem('paystack_reference', reference);
      sessionStorage.setItem('checkout_data', JSON.stringify({
        shippingAddress,
        orderItems: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        taxPrice,
        shippingPrice,
        totalPrice,
      }));

      // Redirect to Paystack payment page
      window.location.href = authorization_url;
    } catch (err) {
      console.error('Paystack payment error:', err);
      setError(err.message || 'Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  // Create order after successful payment
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
        paymentMethod: paymentMethod === 'stripe' ? 'Stripe' : 'Paystack',
        paymentResult,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const response = await ordersAPI.createOrder(orderData);
      
      // Clear cart
      await clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${response.data._id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setError('Payment successful but order creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else {
      await handlePaystackPayment();
    }
  };

  if (!cart || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233e89]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((num) => (
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
                {num < 3 && (
                  <div
                    className={`w-24 h-1 ${
                      step > num ? 'bg-[#233e89]' : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-20 text-sm">
            <span className={step >= 1 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>
              Shipping
            </span>
            <span className={step >= 2 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>
              Payment Method
            </span>
            <span className={step >= 3 ? 'text-[#233e89] font-semibold' : 'text-gray-600'}>
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
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Shipping Address</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (validateShipping()) {
                        setError('');
                        setStep(2);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
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
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={shippingAddress.country}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
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
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233e89] focus:border-transparent"
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
                      Continue to Payment Method
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Select Payment Method</h2>

                  <div className="space-y-4">
                    {/* Stripe Option */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'stripe'
                          ? 'border-[#233e89] bg-blue-50'
                          : 'border-gray-300 hover:border-[#233e89]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-[#233e89]"
                      />
                      <div className="ml-4 flex-1">
                        <div className="font-semibold text-gray-900">Credit/Debit Card (Stripe)</div>
                        <div className="text-sm text-gray-600">
                          Pay securely with your credit or debit card
                        </div>
                      </div>
                      <img
                        src="/stripe-logo.png"
                        alt="Stripe"
                        className="h-8"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </label>

                    {/* Paystack Option */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'paystack'
                          ? 'border-[#233e89] bg-blue-50'
                          : 'border-gray-300 hover:border-[#233e89]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === 'paystack'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-[#233e89]"
                      />
                      <div className="ml-4 flex-1">
                        <div className="font-semibold text-gray-900">Paystack</div>
                        <div className="text-sm text-gray-600">
                          Pay with card, bank transfer, or mobile money
                        </div>
                      </div>
                      <img
                        src="/paystack-logo.png"
                        alt="Paystack"
                        className="h-8"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </label>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-[#233e89] text-white py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Complete Payment</h2>

                  <form onSubmit={handlePayment}>
                    {paymentMethod === 'stripe' && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Card Details
                        </label>
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#424770',
                                  '::placeholder': {
                                    color: '#aab7c4',
                                  },
                                },
                                invalid: {
                                  color: '#9e2146',
                                },
                              },
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Your payment information is secure and encrypted
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'paystack' && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          You will be redirected to Paystack to complete your payment securely.
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || (paymentMethod === 'stripe' && !stripe)}
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
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {cart.items?.map((item) => (
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
                  <span className="font-semibold text-gray-900">
                    {shippingPrice === 0 ? 'Free' : `£${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (20%)</span>
                  <span className="font-semibold text-gray-900">£{taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#233e89]">£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}