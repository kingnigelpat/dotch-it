/**
 * AI Discovery Search Service
 * 
 * Separate search engine function that matches user queries against sellers in the database
 * (name, category, tags, description, location) using relevance scoring.
 * 
 * This standalone function can later be swapped for a real LLM / vector embedding
 * search engine without touching the UI.
 */

import { db } from '../firebase'
import { collection, getDocs, query as fsQuery, where } from 'firebase/firestore'
import { SAMPLE_SELLERS } from '../data/sampleSellers'
import { getDeletedBizIds } from './businessService'

const STOP_WORDS = new Set([
  'in', 'at', 'near', 'around', 'and', 'the', 'for', 'with', 'to', 'of', 'on', 'a', 'an',
  'i', 'im', 'i\'m', 'looking', 'find', 'need', 'want', 'search', 'searching', 'get',
  'where', 'can', 'is', 'are', 'any', 'good', 'best', 'some', 'please'
])

/**
 * Fetches all available sellers from Firestore and merges with Sample Sellers
 */
export async function getAllSellers() {
  const deletedIds = new Set(getDeletedBizIds())
  const sellerMap = new Map()

  // 1. First add all curated sample sellers
  for (const seller of SAMPLE_SELLERS) {
    if (!deletedIds.has(seller.id) && seller.status !== 'deleted' && !seller.isDeleted) {
      sellerMap.set(seller.id, { ...seller })
    }
  }

  // 2. Fetch real businesses from Firestore if available
  if (db) {
    try {
      const col = collection(db, 'businesses')
      const snap = await getDocs(col)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status === 'deleted' || data.isDeleted) {
          deletedIds.add(d.id)
          sellerMap.delete(d.id)
        } else if (data.status !== 'blocked' && !data.isBlocked) {
          sellerMap.set(d.id, {
            id: d.id,
            ...data,
            // Ensure compatibility flags
            isSponsored: Boolean(data.isSponsored || data.sponsored),
            sponsorshipTagline: data.sponsorshipTagline || data.tagline || '',
          })
        }
      })
    } catch (err) {
      console.warn('Firestore fetch sellers fallback to sample data:', err)
    }
  }

  // 3. Merge locally created sellers from localStorage
  try {
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('dotch_biz_')) {
          const raw = localStorage.getItem(key)
          if (raw) {
            const item = JSON.parse(raw)
            if (item?.id && !deletedIds.has(item.id)) {
              sellerMap.set(item.id, { ...item })
            }
          }
        }
      }
    }
  } catch (e) {}

  return Array.from(sellerMap.values())
}

/**
 * Core search function for AI discovery
 * Matches query against sellers in the database with relevance scoring.
 * 
 * @param {string} rawQuery - The natural language query from the buyer
 * @param {Object} options - Optional filtering or ranking options
 * @returns {Promise<Array>} Ranked seller match results
 */
export async function searchSellers(rawQuery = '', options = {}) {
  const query = (rawQuery || '').trim().toLowerCase()
  const allSellers = await getAllSellers()

  if (!query) {
    // If no query, return sponsored first, then by rating
    return [...allSellers].sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1
      if (!a.isSponsored && b.isSponsored) return 1
      return (b.rating || 0) - (a.rating || 0)
    })
  }

  // Tokenize query words
  const tokens = query
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))

  const scoredResults = []

  for (const seller of allSellers) {
    let score = 0
    const matchedReasons = []

    const name = (seller.name || '').toLowerCase()
    const category = (seller.category || '').toLowerCase()
    const description = (seller.description || '').toLowerCase()
    const tagline = (seller.tagline || seller.sponsorshipTagline || '').toLowerCase()
    const location = `${seller.location || ''} ${seller.city || ''} ${seller.state || ''}`.toLowerCase()
    const tags = Array.isArray(seller.tags)
      ? seller.tags.map((t) => String(t).toLowerCase())
      : (seller.keywords || []).map((k) => String(k).toLowerCase())

    // 1. Direct exact whole query match in name or category
    if (name.includes(query)) {
      score += 100
      matchedReasons.push('name_exact')
    } else if (category.includes(query)) {
      score += 70
      matchedReasons.push('category_exact')
    }

    // 2. Token-level matching
    for (const token of tokens) {
      // Name match
      if (name.includes(token)) {
        score += 45
      }

      // Tags match (very high priority)
      const matchingTag = tags.find((t) => t.includes(token) || token.includes(t))
      if (matchingTag) {
        score += 40
        matchedReasons.push(`tag:${matchingTag}`)
      }

      // Category match
      if (category.includes(token)) {
        score += 35
      }

      // Location match (e.g. "Lagos", "Ikeja", "Abuja")
      if (location.includes(token)) {
        score += 30
        matchedReasons.push(`location:${token}`)
      }

      // Tagline match
      if (tagline.includes(token)) {
        score += 25
      }

      // Description match
      if (description.includes(token)) {
        score += 15
      }

      // Plural/singular support (e.g., shoe <-> shoes, laptop <-> laptops)
      if (token.endsWith('s')) {
        const singular = token.slice(0, -1)
        if (singular.length > 2 && (name.includes(singular) || tags.some((t) => t.includes(singular)))) {
          score += 25
        }
      } else {
        const plural = token + 's'
        if (name.includes(plural) || tags.some((t) => t.includes(plural))) {
          score += 25
        }
      }
    }

    // 3. Sponsored seller relevance boost
    // Sponsored sellers rank higher when there is relevance, clearly labeled
    if (score > 0 && seller.isSponsored) {
      score += 25
      matchedReasons.push('sponsored_boost')
    }

    if (score > 0) {
      scoredResults.push({
        ...seller,
        relevanceScore: score,
        matchedReasons,
      })
    }
  }

  // Sort descending by relevance score, then rating
  scoredResults.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    if (a.isSponsored && !b.isSponsored) return -1
    if (!a.isSponsored && b.isSponsored) return 1
    return (b.rating || 0) - (a.rating || 0)
  })

  return scoredResults
}
