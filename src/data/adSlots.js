/**
 * Sponsored Ad Slots Configuration
 * 
 * Configures sponsored placements around the AI discovery interface.
 * Pulls strictly from real businesses in the database with `isSponsored: true`.
 * If no real sponsored sellers are active, slots safely remain hidden.
 */

export const AD_SLOT_CONFIG = {
  topBanner: {
    slotId: 'slot_top_banner',
    badge: 'Sponsored',
    ctaText: 'Visit Store',
  },
  leftColumn: {
    slotId: 'slot_left_column',
    badge: 'Sponsored',
    ctaText: 'Visit',
  },
  rightColumn: {
    slotId: 'slot_right_column',
    badge: 'Sponsored',
    ctaText: 'Visit',
  },
  bottomStrip: {
    slotId: 'slot_bottom_strip',
    badge: 'Sponsored',
    ctaText: 'Visit',
  },
}

/**
 * Resolves a real sponsored seller for a given slot from genuine businesses.
 * Returns null if no real sponsored seller exists.
 */
export function getSponsoredSellerForSlot(slotKey, sellers = []) {
  const cfg = AD_SLOT_CONFIG[slotKey]
  if (!cfg || !Array.isArray(sellers) || sellers.length === 0) return null

  // Find real businesses that are sponsored
  const sponsored = sellers.filter((s) => Boolean(s.isSponsored || s.sponsored) && s.status !== 'deleted')
  if (sponsored.length === 0) return null

  // Distribute across slots
  const slotKeys = Object.keys(AD_SLOT_CONFIG)
  const slotIndex = slotKeys.indexOf(slotKey)
  const match = sponsored[slotIndex % sponsored.length]

  return match
    ? {
        ...match,
        slotBadge: cfg.badge || 'Sponsored',
        ctaText: cfg.ctaText || 'Visit',
      }
    : null
}
