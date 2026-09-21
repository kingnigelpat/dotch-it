import { NIGERIA_LOCATIONS } from '../data/nigeriaLocations'

const SPECIAL_ALIASES = {
  vi: 'Lagos',
  'victoria island': 'Lagos',
  lekki: 'Lagos',
  ikeja: 'Lagos',
  ikoyi: 'Lagos',
  yaba: 'Lagos',
  ph: 'Port Harcourt',
  'port harcourt': 'Port Harcourt',
  fct: 'Abuja (FCT)',
  abuja: 'Abuja (FCT)',
  maitama: 'Abuja (FCT)',
  wuse: 'Abuja (FCT)',
  garki: 'Abuja (FCT)',
  asaba: 'Asaba',
  warri: 'Warri',
  ibadan: 'Ibadan',
  kano: 'Kano',
  enugu: 'Enugu',
}

/**
 * Match a location candidate against known Nigerian states, cities, and common aliases.
 */
export function findMatchingNigerianLocation(candidate) {
  if (!candidate || typeof candidate !== 'string') return null
  const clean = candidate.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
  if (clean.length < 2) return null

  // 1. Direct alias match
  if (SPECIAL_ALIASES[clean]) {
    return SPECIAL_ALIASES[clean]
  }

  // 2. State match
  for (const item of NIGERIA_LOCATIONS) {
    const sName = item.state.toLowerCase()
    if (sName.includes(clean) || clean.includes(sName)) {
      return item.state
    }
  }

  // 3. City match
  for (const item of NIGERIA_LOCATIONS) {
    for (const city of item.cities) {
      const cClean = city.toLowerCase().replace(/\(.*\)/g, '').trim()
      if (cClean && (cClean.includes(clean) || clean.includes(cClean))) {
        // Return state or city
        return item.state
      }
    }
  }

  return null
}

/**
 * Smart natural language query parser for searches like:
 * "bag in lagos" -> { keyword: "bag", location: "Lagos", detectedLocation: "Lagos" }
 * "pizza in lekki" -> { keyword: "pizza", location: "Lagos", detectedLocation: "Lagos" }
 * "hotel in abuja" -> { keyword: "hotel", location: "Abuja (FCT)", detectedLocation: "Abuja (FCT)" }
 * "shoes lagos" -> { keyword: "shoes", location: "Lagos", detectedLocation: "Lagos" }
 */
export function parseQueryAndLocation(queryStr, selectedLocation = '') {
  if (!queryStr || typeof queryStr !== 'string') {
    return {
      keyword: '',
      location: selectedLocation || '',
      detectedLocation: '',
    }
  }

  let text = queryStr.trim()
  let detectedLoc = ''

  // Pattern 1: Preposition phrases: "in <place>", "at <place>", "near <place>", "around <place>"
  const prepRegex = /\b(in|at|near|around)\s+([a-zA-Z\s]+)$/i
  const prepMatch = text.match(prepRegex)
  if (prepMatch) {
    const candidate = prepMatch[2].trim()
    const matched = findMatchingNigerianLocation(candidate)
    if (matched) {
      detectedLoc = matched
      text = text.replace(prepRegex, '').trim()
    }
  }

  // Pattern 2: Multi-word query ending with a location name (e.g. "bag lagos", "cake asaba")
  if (!detectedLoc) {
    const words = text.split(/\s+/)
    if (words.length > 1) {
      const lastWord = words[words.length - 1]
      const matchedLast = findMatchingNigerianLocation(lastWord)
      if (matchedLast) {
        detectedLoc = matchedLast
        text = words.slice(0, -1).join(' ').trim()
      } else {
        // Multi-word query starting with location (e.g. "lagos bags", "abuja hotels")
        const firstWord = words[0]
        const matchedFirst = findMatchingNigerianLocation(firstWord)
        if (matchedFirst) {
          detectedLoc = matchedFirst
          text = words.slice(1).join(' ').trim()
        }
      }
    }
  }

  const isEverywhere =
    !selectedLocation ||
    selectedLocation === 'Everywhere' ||
    selectedLocation === 'All Locations' ||
    selectedLocation === 'All of Nigeria'

  const effectiveLocation = isEverywhere ? (detectedLoc || '') : selectedLocation

  return {
    keyword: text,
    location: effectiveLocation,
    detectedLocation: detectedLoc,
  }
}
