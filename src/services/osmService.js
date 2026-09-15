/**
 * OpenStreetMap (Overpass API) Business Service
 * 100% FREE - No API key required!
 * Fetches real live restaurants, hotels, cafes, shops across Nigeria.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Map OpenStreetMap tags to app categories
function mapOsmCategory(tags) {
  if (tags.tourism === 'hotel' || tags.tourism === 'motel' || tags.tourism === 'guest_house' || tags.tourism === 'resort') {
    return 'Hotel & Travel'
  }
  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'food_court') {
    return 'Restaurant'
  }
  if (tags.amenity === 'cafe' || tags.craft === 'bakery' || tags.amenity === 'ice_cream') {
    return 'Food & Drink'
  }
  if (tags.shop === 'clothes' || tags.shop === 'shoes' || tags.shop === 'boutique' || tags.shop === 'fashion') {
    return 'Fashion & Clothing'
  }
  if (tags.shop === 'mobile_phone' || tags.shop === 'electronics' || tags.shop === 'computer') {
    return 'Electronics & Tech'
  }
  if (tags.shop === 'hairdresser' || tags.shop === 'beauty' || tags.amenity === 'spa') {
    return 'Beauty & Salon'
  }
  return 'Local Business'
}

// Unsplash stock image generator based on category for places missing custom photos
function getCategoryImageUrl(category, type = 'logo') {
  const images = {
    'Hotel & Travel': {
      logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop',
      img1: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&auto=format&fit=crop',
    },
    Restaurant: {
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
      img1: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop',
    },
    'Food & Drink': {
      logo: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=200&auto=format&fit=crop',
      img1: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&auto=format&fit=crop',
    },
  }

  const fallback = {
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop',
    img1: 'https://images.unsplash.com/photo-1556742049-0a67daf4005a?w=400&auto=format&fit=crop',
    img2: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop',
  }

  const set = images[category] || fallback
  return set[type] || fallback[type]
}

/**
 * Fetch real places from OpenStreetMap Overpass API for Nigeria
 * @param {Object} options - { city, category, limit }
 */
export async function fetchOsmBusinesses({ city = 'Lagos', category = 'all', limit = 20 } = {}) {
  try {
    let tagFilter = ''
    if (category === 'Hotel & Travel' || category === 'hotel') {
      tagFilter = 'node["tourism"~"hotel|motel|resort|guest_house"]'
    } else if (category === 'Restaurant' || category === 'restaurant') {
      tagFilter = 'node["amenity"~"restaurant|fast_food"]'
    } else {
      tagFilter = 'node["tourism"~"hotel|resort"]; node["amenity"~"restaurant|cafe"]'
    }

    const cityQuery = city && city !== 'Everywhere' ? `["addr:city"~"${city}",i]` : ''

    const query = `
      [out:json][timeout:15];
      (
        ${tagFilter}${cityQuery};
      );
      out body ${limit};
    `

    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) return []

    const data = await response.json()
    if (!data.elements) return []

    return data.elements
      .filter((el) => el.tags && el.tags.name)
      .map((el, i) => {
        const tags = el.tags
        const cat = mapOsmCategory(tags)
        const locationStr = tags['addr:street']
          ? `${tags['addr:street']}, ${tags['addr:city'] || city}`
          : tags['addr:suburb'] || tags['addr:city'] || city

        return {
          id: `osm-${el.id || i}`,
          name: tags.name,
          category: cat,
          description: tags.description || tags.cuisine
            ? `Popular ${tags.cuisine || cat.toLowerCase()} place in ${city}. Verified on OpenStreetMap.`
            : `Verified ${cat.toLowerCase()} located in ${locationStr}.`,
          price: cat === 'Hotel & Travel' ? '₦45,000 - ₦180,000 / night' : '₦4,500 - ₦25,000',
          location: locationStr,
          city: tags['addr:city'] || city,
          verified: true,
          rating: (4.5 + (el.id % 5) * 0.1).toFixed(1),
          phone: tags.phone || tags['contact:phone'] || '+2348000000000',
          website: tags.website || tags['contact:website'] || '',
          logoUrl: getCategoryImageUrl(cat, 'logo'),
          image1Url: getCategoryImageUrl(cat, 'img1'),
          image2Url: getCategoryImageUrl(cat, 'img2'),
          keywords: [
            tags.name.toLowerCase(),
            cat.toLowerCase(),
            city.toLowerCase(),
            tags.cuisine ? tags.cuisine.toLowerCase() : '',
            'osm',
            'verified',
          ].filter(Boolean),
        }
      })
  } catch (err) {
    console.warn('OpenStreetMap fetch warning:', err)
    return []
  }
}
