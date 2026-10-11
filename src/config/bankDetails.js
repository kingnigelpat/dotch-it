// Dotch Official Verification & Admin WhatsApp Configuration
// Users verify their free business listing by sending their Business Registration / Company Certificate (CAC) to Admin on WhatsApp (+234 707 354 4811).
// For paid Campaign Ads, users message Admin on WhatsApp for official account details.

export const BANK_DETAILS = {
  adminWhatsApp: '2347073544811',
  formattedAdminWhatsApp: '+234 707 354 4811',
  currency: '₦',
}

/**
 * Returns formatted WhatsApp link for sending Business / Company Certificate (CAC) for listing verification
 */
export function getCertificateVerificationWhatsAppUrl({ businessName, email, phone } = {}) {
  const adminPhone = '2347073544811'
  const text = encodeURIComponent(
    `Hello Dotch Admin,\n\nI have registered my business "${businessName || 'My Business'}" on Dotch.\n\nAccount Email: ${email || 'Not specified'}\nWhatsApp Line: ${phone || 'Not specified'}\n\nAttached is my Business Registration / Company Certificate (CAC) for verification so my listing can be unlocked and made live on the directory.`
  )
  return `https://wa.me/${adminPhone}?text=${text}`
}

/**
 * Returns formatted WhatsApp link for requesting account number & submitting campaign payment proof
 */
export function getPaymentWhatsAppUrl({ email, planName, planAmount, vendorName, campaignTitle } = {}) {
  const phone = '2347073544811'
  const text = encodeURIComponent(
    `Hello Dotch Admin,\n\nI want to launch a campaign ad on Dotch (${planName || 'Campaign Banner'} - ${planAmount || '₦250'}).\n\nAd Title: ${campaignTitle || 'Spotlight Banner'}\n${vendorName ? `Brand / Store: ${vendorName}\n` : ''}${email ? `Account Email: ${email}\n` : ''}\nPlease send me your official account number so I can make payment and activate my ad.`
  )
  return `https://wa.me/${phone}?text=${text}`
}
