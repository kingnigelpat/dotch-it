// Social Explorer & Addictive Interaction Store
// Handles likes, bookmarks, vibe tagging, and live explorer social proof

const LIKES_KEY = 'dotch_social_likes_v1'
const SAVES_KEY = 'dotch_social_saves_v1'

function getStoredLikes() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || '{}')
  } catch {
    return {}
  }
}

function getStoredSaves() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(SAVES_KEY) || '{}')
  } catch {
    return {}
  }
}

// Generate deterministic base stats based on business ID / Name
export function getBusinessStats(business) {
  if (!business) return { likes: 42, savesToday: 12, views: 320, isTrending: false }
  
  const idStr = String(business.id || business.name || 'dotch')
  let hash = 0
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i)
    hash |= 0
  }
  const seed = Math.abs(hash)
  
  const baseLikes = 25 + (seed % 160)
  const savesToday = 4 + (seed % 38)
  const views = 150 + (seed % 850)
  const isTrending = (seed % 3 === 0) || Number(business.rating || 4.5) >= 4.8
  const isHiddenGem = (seed % 5 === 0) || (business.verified && Number(business.rating || 4.5) >= 4.7)

  return {
    baseLikes,
    savesToday,
    views,
    isTrending,
    isHiddenGem,
  }
}

export function isBusinessLiked(id) {
  const likes = getStoredLikes()
  return Boolean(likes[id])
}

export function toggleBusinessLike(id) {
  const likes = getStoredLikes()
  const isLiked = Boolean(likes[id])
  if (isLiked) {
    delete likes[id]
  } else {
    likes[id] = Date.now()
  }
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
    window.dispatchEvent(new CustomEvent('dotch_social_update', { detail: { type: 'like', id, isLiked: !isLiked } }))
  } catch (e) {
    console.warn('Storage error', e)
  }
  return !isLiked
}

export function isBusinessSaved(id) {
  const saves = getStoredSaves()
  return Boolean(saves[id])
}

export function toggleBusinessSave(id, businessData = null) {
  const saves = getStoredSaves()
  const isSaved = Boolean(saves[id])
  if (isSaved) {
    delete saves[id]
  } else {
    saves[id] = businessData || { id, savedAt: Date.now() }
  }
  try {
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves))
    window.dispatchEvent(new CustomEvent('dotch_social_update', { detail: { type: 'save', id, isSaved: !isSaved } }))
  } catch (e) {
    console.warn('Storage error', e)
  }
  return !isSaved
}

// Generate aesthetic "Vibe Tags" (e.g. #CozyVibes, #Aesthetic, #LateNight, #TechHaven)
export function getVibeTags(business) {
  const cat = (business?.category || '').toLowerCase()
  const name = (business?.name || '').toLowerCase()
  const desc = (business?.description || '').toLowerCase()
  const tags = []

  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('dining')) {
    tags.push('🍽️ Foodie Fav')
    if (desc.includes('jollof') || desc.includes('grill') || desc.includes('wings')) tags.push('🔥 Must Try')
    if (desc.includes('lounge') || desc.includes('bar') || desc.includes('cocktail')) tags.push('🍸 Night Vibe')
    else tags.push('✨ Aesthetic Spot')
  } else if (cat.includes('tech') || cat.includes('electronic') || cat.includes('phone')) {
    tags.push('⚡ Tech Haven')
    tags.push('🛡️ Verified Gadgets')
  } else if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('wear')) {
    tags.push('👟 Drip & Style')
    tags.push('🛍️ Curated Drops')
  } else if (cat.includes('beauty') || cat.includes('spa') || cat.includes('salon')) {
    tags.push('💆 Glow Up')
    tags.push('✨ Self Care')
  } else if (cat.includes('auto') || cat.includes('car')) {
    tags.push('🚗 Quick Fix')
    tags.push('🔧 Pro Care')
  } else {
    tags.push('🌟 Hidden Gem')
    tags.push('📍 Explorer Pick')
  }

  if (business?.verified) {
    tags.push('✓ Verified Spot')
  }

  return tags.slice(0, 3)
}
