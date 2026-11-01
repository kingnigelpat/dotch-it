// Dotch Official Verification & Admin Contact Configuration
// Admin Email: championsmail18@gmail.com
// Admin Phone / WhatsApp: 07073544811 (+234 707 354 4811)

export const ADMIN_EMAIL = 'championsmail18@gmail.com'
export const ADMIN_PHONE_RAW = '07073544811'
export const ADMIN_PHONE_INTL = '2347073544811'
export const ADMIN_PHONE_DISPLAY = '07073544811'
export const ADMIN_TEL_HREF = 'tel:07073544811'

export const BANK_DETAILS = {
  adminEmail: ADMIN_EMAIL,
  adminWhatsApp: ADMIN_PHONE_INTL,
  formattedAdminWhatsApp: '+234 707 354 4811',
  currency: '₦',
}

/**
 * Returns formatted mailto link to send proof of business (CAC report or other document) to championsmail18@gmail.com
 */
export function getBusinessVerificationMailtoUrl({ businessName, email, phone } = {}) {
  const subject = encodeURIComponent(`Proof of Business Verification - ${businessName || 'Business Listing'}`)
  const body = encodeURIComponent(
    `Hello Dotch Verification Team,\n\nI am submitting proof of business for official verification on Dotch.\n\nBusiness Name: ${businessName || ''}\nAccount Email: ${email || ''}\nPhone / WhatsApp: ${phone || ''}\n\nAttached: CAC Report / Business Registration Certificate / other proof of business document.\n\nPlease review and approve our verification status.\n\nThank you!`
  )
  return `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`
}

/**
 * Returns formatted WhatsApp link for 72-hour business verification
 */
export function get72HourVerificationWhatsAppUrl({ businessName, email, phone } = {}) {
  const text = encodeURIComponent(
    `Hello Dotch Admin,\n\nI just posted my business "${businessName || 'My Store'}" on Dotch.\n\nAccount Email: ${email || 'Not specified'}\nPhone/WhatsApp: ${phone || 'Not specified'}\n\nI have sent my CAC report / business document to championsmail18@gmail.com for verification.`
  )
  return `https://wa.me/${ADMIN_PHONE_INTL}?text=${text}`
}

/**
 * Returns formatted WhatsApp link for sending Business / Company Certificate (CAC) for listing verification
 */
export function getCertificateVerificationWhatsAppUrl({ businessName, email, phone } = {}) {
  return get72HourVerificationWhatsAppUrl({ businessName, email, phone })
}

/**
 * Returns formatted WhatsApp link for requesting account number & submitting campaign payment proof
 */
export function getPaymentWhatsAppUrl({ email, planName, planAmount, vendorName, campaignTitle } = {}) {
  const text = encodeURIComponent(
    `Hello Dotch Admin,\n\nI want to launch a campaign ad on Dotch (${planName || 'Campaign Banner'} - ${planAmount || '₦250'}).\n\nAd Title: ${campaignTitle || 'Spotlight Banner'}\n${vendorName ? `Brand / Store: ${vendorName}\n` : ''}${email ? `Account Email: ${email}\n` : ''}\nPlease send me your official account number so I can make payment and activate my ad.`
  )
  return `https://wa.me/${ADMIN_PHONE_INTL}?text=${text}`
}
