/**
 * Utility for formatting and normalizing phone numbers to standard +234 (Nigeria) format.
 */

/**
 * Converts any input phone number into standard international +234 format.
 * Examples:
 * - '08012345678'       => '+2348012345678'
 * - '07031234567'       => '+2347031234567'
 * - '2348012345678'     => '+2348012345678'
 * - '+2348012345678'    => '+2348012345678'
 * - '+234 801 234 5678' => '+2348012345678'
 * - '+23408012345678'   => '+2348012345678'
 * - '8012345678'        => '+2348012345678'
 */
export function formatTo234(phone) {
  if (!phone) return ''
  const cleaned = String(phone).trim()
  if (!cleaned) return ''

  // Strip all non-numeric characters
  let digits = cleaned.replace(/[^0-9]/g, '')
  if (!digits) return ''

  // Handle common mistake: +234 followed by a leading 0 (e.g. 23408012345678)
  if (digits.startsWith('2340')) {
    digits = '234' + digits.slice(4)
  }

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
 * Strips country code (+234 / 234) and leading 0 to extract national 10-digit number.
 * Examples:
 * - '+2348012345678'  => '8012345678'
 * - '08012345678'     => '8012345678'
 * - '2348012345678'   => '8012345678'
 * - '8012345678'      => '8012345678'
 */
export function extractNationalDigits(phone) {
  if (!phone) return ''
  let digits = String(phone).replace(/[^0-9]/g, '')
  if (!digits) return ''

  if (digits.startsWith('2340')) {
    digits = digits.slice(4)
  } else if (digits.startsWith('234')) {
    digits = digits.slice(3)
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  return digits
}

/**
 * Formats 10-digit national number with spaces: '801 234 5678'
 */
export function formatNationalDigits(digits) {
  const clean = String(digits || '').replace(/[^0-9]/g, '')
  if (!clean) return ''
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`
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
