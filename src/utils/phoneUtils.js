/**
 * Utility for formatting and normalizing phone numbers to standard +234 (Nigeria) format.
 */

/**
 * Converts any input phone number into standard international +234 format.
 * Examples:
 * - '08012345678'     => '+2348012345678'
 * - '07031234567'     => '+2347031234567'
 * - '2348012345678'   => '+2348012345678'
 * - '+2348012345678'  => '+2348012345678'
 * - '8012345678'      => '+2348012345678'
 */
export function formatTo234(phone) {
  if (!phone) return ''
  const cleaned = String(phone).trim()
  if (!cleaned) return ''

  // If already starts with +
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.replace(/[^0-9]/g, '')
    if (digitsOnly.startsWith('234')) {
      return `+${digitsOnly}`
    }
    // Return formatted international number
    return `+${digitsOnly}`
  }

  // Strip all non-numeric characters
  const digits = cleaned.replace(/[^0-9]/g, '')
  if (!digits) return ''

  if (digits.startsWith('234')) {
    return `+${digits}`
  }

  if (digits.startsWith('0')) {
    return `+234${digits.slice(1)}`
  }

  return `+234${digits}`
}

/**
 * Returns digits-only string without '+' suitable for wa.me/ links.
 * Example: '+2348012345678' => '2348012345678'
 */
export function normalizeWhatsAppPhone(phone) {
  const formatted = formatTo234(phone)
  return formatted.replace(/[^0-9]/g, '')
}

/**
 * Formats a phone number for clean UI display with spacing.
 * Example: '+2348012345678' => '+234 801 234 5678'
 */
export function displayFormattedPhone(phone) {
  if (!phone) return ''
  const formatted = formatTo234(phone)

  // Standard Nigerian 10-digit mobile number after +234 (e.g. +234 801 234 5678)
  const matchMobile = formatted.match(/^\+234(\d{3})(\d{3})(\d{4})$/)
  if (matchMobile) {
    return `+234 ${matchMobile[1]} ${matchMobile[2]} ${matchMobile[3]}`
  }

  // Short/Landline numbers after +234 (e.g. +234 1 277 2700)
  const matchLandline = formatted.match(/^\+234(\d{1,3})(\d{3,4})(\d{4})$/)
  if (matchLandline) {
    return `+234 ${matchLandline[1]} ${matchLandline[2]} ${matchLandline[3]}`
  }

  return formatted
}
