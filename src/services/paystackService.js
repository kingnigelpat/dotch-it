const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

export const isPaystackConfigured = Boolean(paystackKey)

export const LISTING_PLAN_FREE = {
  id: 'free_forever',
  name: 'Free Vendor Listing',
  price: 0,
  formattedPrice: 'Free Forever',
  interval: 'No Renewal Fees',
  badge: '🎉 100% Free For All Vendors',
  features: [
    '📸 Full photo uploads of your shop & products',
    '📍 Exact City & Neighborhood location listing',
    '📞 Direct Phone & WhatsApp contact buttons (0% commission)',
    '✓ Verified Business Badge',
    '⚡ Instant directory search indexing',
    '🎯 Customer click & WhatsApp inquiry tracking',
  ],
  cta: 'List Business for Free',
  highlight: true,
}

export const SUBSCRIPTION_PLANS = [
  LISTING_PLAN_FREE,
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
 * Initialize Paystack Campaign Banner Checkout (e.g. ₦250 for 3 days)
 */
export async function initializePaystackCampaignCheckout({
  email,
  amount, // In Naira (e.g. 250)
  packageId,
  packageName,
  adTitle,
  businessName,
  onSuccess,
  onClose,
}) {
  const loaded = await loadPaystackScript()

  if (!loaded || !window.PaystackPop || !paystackKey) {
    // If running in development sandbox or without key, offer safe test simulation
    const confirmTest = window.confirm(
      `[Paystack Campaign Checkout]\n\nCampaign: ${packageName} (${adTitle || businessName})\nDuration: 3 Days\nAmount: ₦${amount.toLocaleString()}\n\nProceed with payment simulation?`
    )
    if (confirmTest) {
      const mockRef = `pay_camp_${Date.now()}_${Math.random().toString(36).substring(7)}`
      onSuccess({
        reference: mockRef,
        status: 'success',
        packageId,
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
        { display_name: 'Campaign Package', variable_name: 'package_name', value: packageName },
        { display_name: 'Ad Title', variable_name: 'ad_title', value: adTitle },
        { display_name: 'Business Name', variable_name: 'business_name', value: businessName },
      ],
    },
    callback: function (response) {
      if (onSuccess) {
        onSuccess({
          reference: response.reference,
          status: 'success',
          packageId,
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

/**
 * Backwards compatibility for initializePaystackSubscription
 */
export async function initializePaystackSubscription({
  email,
  amount,
  planId,
  businessId,
  businessName,
  onSuccess,
  onClose,
}) {
  return initializePaystackCampaignCheckout({
    email,
    amount,
    packageId: planId,
    packageName: planId,
    adTitle: businessName,
    businessName,
    onSuccess,
    onClose,
  })
}

