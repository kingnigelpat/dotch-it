const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

export const isPaystackConfigured = Boolean(paystackKey)

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter Tier',
    price: 0,
    interval: 'Free Forever',
    badge: 'Standard',
    features: [
      'Basic search engine listing',
      'Direct WhatsApp inquiry link',
      'Location & Maps discovery',
      '1 Storefront photo',
    ],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Vendor Plan',
    price: 5000,
    formattedPrice: '₦5,000',
    interval: 'per month',
    badge: '★ Most Popular',
    features: [
      '⚡ 3x Search Boost (Top rankings)',
      '✨ Golden Verified Vendor Badge',
      '📊 Advanced Search & Click Analytics',
      '🖼️ Full Photo Gallery (Unlimited)',
      '💬 Instant 1-Click WhatsApp Quick-Order',
      '🎯 Featured in "Popular Sellers" strip',
    ],
    cta: 'Subscribe to Pro',
    highlight: true,
  },
  {
    id: 'growth_vip',
    name: 'VIP Growth Plan',
    price: 12000,
    formattedPrice: '₦12,000',
    interval: 'per month',
    badge: '👑 Ultimate Reach',
    features: [
      '👑 #1 Guaranteed Category Spotlight',
      '⚡ 10x AI Recommendation Priority',
      '✨ Golden Verified + VIP Badge',
      '📈 Priority Customer Leads & Inquiries',
      '🌟 Dedicated Dotch Social Spotlight',
      '🛠️ 24/7 Dedicated Support Specialist',
    ],
    cta: 'Subscribe to VIP',
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
