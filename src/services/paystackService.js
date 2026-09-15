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
      '❌ No Photo uploads of place or products',
      '❌ No Location or Area listing',
      'Basic unverified search presence',
    ],
    cta: 'Current Free Tier',
    highlight: false,
  },
  {
    id: 'pro_1m',
    name: '1 Month Vendor Plan',
    price: 5000,
    formattedPrice: '₦5,000',
    interval: 'for 1 month (30 days)',
    badge: '★ 1 Month Access',
    features: [
      '📸 Post Photos of your place & products',
      '📍 List your Exact Location & City (Lagos, Abuja, PH, etc.)',
      '📞 Direct Phone & WhatsApp number for buyers, tourists & researchers',
      '⚡ 3x Search Visibility Boost in your city',
      '✓ Verified Seller Badge',
      '🎯 Customer click & inquiry tracking',
    ],
    cta: 'Subscribe for ₦5,000 (1 Month)',
    highlight: false,
  },
  {
    id: 'pro_2m',
    name: '2 Months Vendor Plan',
    price: 7999,
    formattedPrice: '₦7,999',
    interval: 'for 2 months (60 days)',
    badge: '🔥 Best Value • Save ₦2,001',
    features: [
      '📸 Unlimited Photos of your place & products',
      '📍 Priority Location & Area Discovery for Tourists & Researchers',
      '📞 Direct WhatsApp & Phone hotline linking',
      '⚡ 5x Search Visibility Boost',
      '✓ Verified Gold Vendor Badge',
      '🌟 Featured on Top Search results',
      '💰 Save over ₦2,000 compared to single month',
    ],
    cta: 'Subscribe for ₦7,999 (2 Months)',
    highlight: true,
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
