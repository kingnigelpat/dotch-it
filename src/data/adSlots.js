/**
 * Sponsored Ad Slots Configuration
 * 
 * Edit this file to configure or re-assign which sponsored sellers appear in:
 * - Top Banner (displayed above the AI discovery interface)
 * - Left Column (desktop side column)
 * - Right Column (desktop side column)
 * - Bottom Strip (strip below the AI search and results)
 * 
 * Each ad automatically pulls from sellers inside the app with `isSponsored: true`.
 */

import { SAMPLE_SELLERS } from './sampleSellers'

export const AD_SLOT_CONFIG = {
  // Banner at the very top of the AI discovery screen
  topBanner: {
    slotId: 'slot_top_banner',
    sellerId: 'apex-gadgets-ikeja',
    badge: 'Sponsored',
    ctaText: 'Visit Store',
  },

  // Desktop Left Side Column Ad
  leftColumn: {
    slotId: 'slot_left_column',
    sellerId: 'zainab-luxury-couture',
    badge: 'Sponsored',
    ctaText: 'Explore Collection',
  },

  // Desktop Right Side Column Ad
  rightColumn: {
    slotId: 'slot_right_column',
    sellerId: 'urban-kicks-lagos',
    badge: 'Sponsored',
    ctaText: 'Shop Sneakers',
  },

  // Strip at the bottom of the page
  bottomStrip: {
    slotId: 'slot_bottom_strip',
    sellerId: 'golden-crust-bakery',
    badge: 'Sponsored',
    ctaText: 'Order Now',
  },
}

/**
 * Resolves a sponsored seller object for a given slot.
 * Falls back to any available sponsored seller if specific ID isn't found.
 */
export function getSponsoredSellerForSlot(slotKey) {
  const cfg = AD_SLOT_CONFIG[slotKey]
  if (!cfg) return null

  // 1. Look for seller by configured ID
  const match = SAMPLE_SELLERS.find((s) => s.id === cfg.sellerId && s.isSponsored)
  if (match) {
    return {
      ...match,
      slotBadge: cfg.badge || 'Sponsored',
      ctaText: cfg.ctaText || 'Visit',
    }
  }

  // 2. Fallback to any sponsored seller
  const fallback = SAMPLE_SELLERS.find((s) => s.isSponsored) || SAMPLE_SELLERS[0]
  return fallback ? {
    ...fallback,
    slotBadge: cfg.badge || 'Sponsored',
    ctaText: cfg.ctaText || 'Visit',
  } : null
}
