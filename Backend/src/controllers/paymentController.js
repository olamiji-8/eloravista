import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe payment intent with all payment methods
export const createStripePayment = async (req, res) => {
  try {
    console.log('=== Payment Intent Request ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { amount, currency = 'gbp' } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment configuration error' 
      });
    }

    const amountInCents = Math.round(amount * 100);
    console.log(`Creating payment intent: £${amount} (${amountInCents} pence)`);

    // Use ONLY automatic_payment_methods (this enables all payment methods you've activated in Stripe Dashboard)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always', // This allows Klarna, Clearpay, etc.
      },
      metadata: { 
        userId: req.user?.id || 'guest',
        userEmail: req.user?.email || 'no-email',
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    res.status(200).json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('=== Stripe payment intent error ===');
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Handle Stripe webhook events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('Webhook event received:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      console.log('Payment metadata:', paymentIntent.metadata);
      
      // You can update order status here if needed
      // const orderId = paymentIntent.metadata.orderId;
      // await Order.findByIdAndUpdate(orderId, { isPaid: true, paidAt: Date.now() });
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      console.log('Failure reason:', failedPayment.last_payment_error?.message);
      
      // Handle failed payment
      // You might want to notify the user or update order status
      
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};