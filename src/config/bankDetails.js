// Dotch Official Payment & Bank Transfer Configuration
export const BANK_DETAILS = {
  bankName: 'Paga',
  accountNumber: '0966048427',
  accountName: 'UMUTITE NIGEL EDESIRI',
  // Admin WhatsApp number for receiving payment receipts
  // Can be overridden in .env via VITE_ADMIN_WHATSAPP
  adminWhatsApp: import.meta.env.VITE_ADMIN_WHATSAPP || '2347073544811',
  currency: '₦',
}

/**
 * Returns formatted WhatsApp link for vendor payment proof
 */
export function getPaymentWhatsAppUrl({ email, planName, planAmount, vendorName }) {
  const phone = (BANK_DETAILS.adminWhatsApp || '').replace(/[^0-9]/g, '')
  const text = encodeURIComponent(
    `Hello Dotch Admin,\n\nI have made a bank transfer of ${planAmount} to your Paga account (${BANK_DETAILS.accountNumber}) for the ${planName}.\n\nVendor Email: ${email || ''}${vendorName ? `\nVendor Name: ${vendorName}` : ''}\n\nAttached is my payment receipt to verify and unlock my business listing.`
  )
  return `https://wa.me/${phone}?text=${text}`
}
