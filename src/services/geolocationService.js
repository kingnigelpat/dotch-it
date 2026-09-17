// Geolocation Service for DOTCH
// Provides accurate GPS tracking, distance calculation (Haversine formula),
// Nigerian city coordinate lookups, and reverse geocoding with failover.

// Approximate center coordinates for key Nigerian commercial hubs & states
export const NIGERIA_CITY_COORDS = {
  // Lagos
  'lagos': { lat: 6.5244, lng: 3.3792 },
  'ikeja': { lat: 6.6018, lng: 3.3515 },
  'lekki': { lat: 6.4698, lng: 3.5852 },
  'victoria island': { lat: 6.4281, lng: 3.4219 },
  'vi': { lat: 6.4281, lng: 3.4219 },
  'yaba': { lat: 6.5095, lng: 3.3711 },
  'surulere': { lat: 6.4969, lng: 3.3542 },
  'ajah': { lat: 6.4654, lng: 3.5676 },
  'ikorodu': { lat: 6.6194, lng: 3.5105 },

  // Abuja (FCT)
  'abuja': { lat: 9.0765, lng: 7.3986 },
  'wuse': { lat: 9.0783, lng: 7.4727 },
  'maitama': { lat: 9.0882, lng: 7.4933 },
  'gwarinpa': { lat: 9.1084, lng: 7.4069 },
  'garki': { lat: 9.0347, lng: 7.4850 },

  // Rivers / Port Harcourt
  'port harcourt': { lat: 4.8156, lng: 7.0498 },
  'rivers': { lat: 4.8156, lng: 7.0498 },

  // Oyo / Ibadan
  'ibadan': { lat: 7.3775, lng: 3.9470 },
  'oyo': { lat: 7.3775, lng: 3.9470 },

  // Delta
  'asaba': { lat: 6.1979, lng: 6.7294 },
  'warri': { lat: 5.5544, lng: 5.7932 },
  'delta': { lat: 6.1979, lng: 6.7294 },

  // Edo / Benin
  'benin': { lat: 6.3350, lng: 5.6037 },
  'benin city': { lat: 6.3350, lng: 5.6037 },

  // Enugu
  'enugu': { lat: 6.4584, lng: 7.5464 },

  // Kano
  'kano': { lat: 12.0022, lng: 8.5920 },

  // Anambra
  'awka': { lat: 6.2209, lng: 7.0679 },
  'onitsha': { lat: 6.1437, lng: 6.7870 },

  // Akwa Ibom & Cross River
  'uyo': { lat: 5.0377, lng: 7.9128 },
  'calabar': { lat: 4.9757, lng: 8.3417 },

  // Imo & Abia
  'owerri': { lat: 5.4832, lng: 7.0358 },
  'aba': { lat: 5.1066, lng: 7.3667 },
  'umuahia': { lat: 5.5249, lng: 7.4946 },

  // Kwara & Ogun
  'ilorin': { lat: 8.4966, lng: 4.5421 },
  'abeokuta': { lat: 7.1475, lng: 3.3619 },
  'ota': { lat: 6.6906, lng: 3.2359 },
}

/**
 * Calculates straight-line distance in kilometers between two lat/lng points
 * using the Haversine formula.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null
  const R = 6371 // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return Math.round(d * 10) / 10 // Rounded to 1 decimal place (e.g. 2.4 km)
}

/**
 * Attempts to resolve coordinates for a location string (city/state)
 */
export function getCoordsForLocationString(locStr) {
  if (!locStr || typeof locStr !== 'string') return null
  const clean = locStr.toLowerCase().trim()
  
  for (const [key, coords] of Object.entries(NIGERIA_CITY_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords
    }
  }
  return null
}

/**
 * Robust Browser Geolocation Detector with multi-source reverse geocoding
 * Returns { lat, lng, city, state, locationName }
 */
export function getBrowserCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('GPS location is not supported by your browser.'))
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        let detectedCity = ''
        let detectedState = ''

        // 1. Primary Reverse Geocoding (Nominatim OpenStreetMap)
        try {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 4000)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { signal: controller.signal }
          )
          clearTimeout(timer)
          if (res.ok) {
            const data = await res.json()
            const addr = data.address || {}
            detectedCity = addr.city || addr.city_district || addr.town || addr.suburb || addr.county || ''
            detectedState = addr.state || ''
          }
        } catch {
          // Ignore Nominatim timeout/error
        }

        // 2. Secondary Reverse Geocoding Fallback (BigDataCloud Free API)
        if (!detectedCity && !detectedState) {
          try {
            const res2 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            if (res2.ok) {
              const data2 = await res2.json()
              detectedCity = data2.city || data2.locality || data2.principalSubdivision || ''
              detectedState = data2.principalSubdivision || ''
            }
          } catch {
            // Ignore secondary fallback
          }
        }

        // Clean state name (e.g. "Lagos State" -> "Lagos")
        let finalState = detectedState.replace(/\s*state/i, '').trim()
        let finalCity = detectedCity.trim()

        const locationName = finalCity || finalState || 'Current Location'

        resolve({
          lat: latitude,
          lng: longitude,
          city: finalCity,
          state: finalState,
          locationName,
        })
      },
      (error) => {
        let msg = 'Unable to get your current location.'
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.'
        }
        reject(new Error(msg))
      },
      options
    )
  })
}
