const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

export const isPaystackConfigured = Boolean(paystackKey)

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Free Basic Tier',
    price: 0,
    interval: 'Free Forever',
    badge: 'Basic Name Listing',
    features: [
      'Business name indexed in directory',
      '❌ No Phone or WhatsApp contact numbers allowed',
      '❌ No Photo uploads allowed',
      '❌ No Location or Area listing (Accounts adding location on Free get flagged/blocked)',
      'Basic unverified search presence',
    ],
    cta: 'Current Free Tier',
    highlight: false,
  },
  {
    id: 'pro_monthly',
    name: 'Standard Business Listing',
    price: 5000,
    formattedPrice: '₦5,000',
    interval: 'per month',
    badge: '★ Standard Business',
    features: [
      '📍 Full Location & Neighborhood discovery (Lagos, Abuja, PH, etc.)',
      '📞 Direct WhatsApp & Phone contact linking',
      '🖼️ Upload Logo and Product Photos',
      '⚡ 3x Search Visibility Boost',
      '✓ Verified Seller Badge',
      '🎯 Search & Click Analytics',
    ],
    cta: 'Subscribe for ₦5,000/mo',
    highlight: true,
  },
  {
    id: 'enterprise_monthly',
    name: 'Corporate & Hotel Tier',
    price: 10000,
    formattedPrice: '₦10,000',
    interval: 'per month',
    badge: '👑 Enterprise / Hotels',
    features: [
      '🏨 Ideal for Hotels, Suites, Clubs, Auto Centers & Big Brands',
      '👑 #1 Top Category Spotlight placement',
      '⚡ 10x AI Query Recommendation Boost',
      '🖼️ Unlimited HD Photos & Suite/Product Galleries',
      '📞 Multi-line Priority WhatsApp Booking',
      '🌟 Dedicated Priority Customer Support',
    ],
    cta: 'Subscribe for ₦10,000/mo',
    highlight: false,
  },
]

// Dynamically load Paystack inline script
function loadPaystackScript() {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Initialize Paystack Subscription Checkout
 */
export async function initializePaystackSubscription({
  email,
  amount, // In Naira (e.g. 5000)
  planId,
  businessId,
  businessName,
  onSuccess,
  onClose,
}) {
  const loaded = await loadPaystackScript()

  if (!loaded || !window.PaystackPop || !paystackKey) {
    // If running in development sandbox or without key, offer safe test simulation
    const confirmTest = window.confirm(
      `[Paystack Test Checkout]\n\nSimulating payment for ${businessName}\nPlan: ${planId}\nAmount: ₦${amount.toLocaleString()}\n\nProceed with simulated payment?`
    )
    if (confirmTest) {
      const mockRef = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`
      onSuccess({
        reference: mockRef,
        status: 'success',
        planId,
        amount,
        paidAt: new Date().toISOString(),
      })
    } else if (onClose) {
      onClose()
    }
    return
  }

  const handler = window.PaystackPop.setup({
    key: paystackKey,
    email: email,
    amount: amount * 100, // Paystack expects amount in Kobo
    currency: 'NGN',
    metadata: {
      custom_fields: [
        { display_name: 'Business Name', variable_name: 'business_name', value: businessName },
        { display_name: 'Plan ID', variable_name: 'plan_id', value: planId },
        { display_name: 'Business ID', variable_name: 'business_id', value: businessId },
      ],
    },
    callback: function (response) {
      // response: { reference: string, status: 'success', trans: string, ... }
      if (onSuccess) {
        onSuccess({
          reference: response.reference,
          status: 'success',
          planId,
          amount,
          paidAt: new Date().toISOString(),
        })
      }
    },
    onClose: function () {
      if (onClose) onClose()
    },
  })

  handler.openIframe()
}
