/**
 * Utility to inject structured Schema.org JSON-LD and meta tags for business profiles.
 * Gives search engines structured information about the business and improves DOTCH's
 * eligibility for relevant search features.
 */
export function applyBusinessSeo(business) {
  if (!business || typeof document === 'undefined') return () => {}

  const previousTitle = document.title
  const businessName = business.name || 'Verified Nigerian Business'
  const locationStr = business.city || business.location || 'Nigeria'
  const pageUrl = window.location.href

  // 1. Dynamic Title
  document.title = `${businessName} — ${locationStr} | DOTCH`

  // 2. Meta Description
  const metaDesc = business.description
    ? `${business.description.slice(0, 150)}... Contact directly on WhatsApp via DOTCH.`
    : `Find ${businessName} in ${locationStr}. View verified photos, products, exact location and contact on WhatsApp via DOTCH.`
  setMetaTag('name', 'description', metaDesc)

  // 3. OpenGraph Tags
  setMetaTag('property', 'og:title', `${businessName} — ${locationStr} | DOTCH`)
  setMetaTag('property', 'og:description', metaDesc)
  setMetaTag('property', 'og:url', pageUrl)
  if (business.logoUrl || business.image1Url) {
    setMetaTag('property', 'og:image', business.image1Url || business.logoUrl)
  }

  // 4. Schema.org JSON-LD Structured Data
  const schemaType = getSchemaType(business.category)
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: businessName,
    description: business.description || '',
    url: pageUrl,
    telephone: business.phone || '',
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.city || locationStr,
      addressRegion: business.location || locationStr,
      addressCountry: 'NG',
    },
  }

  if (business.price) {
    schemaData.priceRange = business.price
  }

  const images = [business.logoUrl, business.image1Url, business.image2Url].filter(Boolean)
  if (images.length > 0) {
    schemaData.image = images
  }

  if (business.lat && business.lng) {
    schemaData.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.lat,
      longitude: business.lng,
    }
  }

  // Inject or update JSON-LD script tag
  let scriptTag = document.getElementById('dotch-business-jsonld')
  if (!scriptTag) {
    scriptTag = document.createElement('script')
    scriptTag.id = 'dotch-business-jsonld'
    scriptTag.type = 'application/ld+json'
    document.head.appendChild(scriptTag)
  }
  scriptTag.textContent = JSON.stringify(schemaData)

  // Cleanup on unmount
  return () => {
    document.title = previousTitle
    const existing = document.getElementById('dotch-business-jsonld')
    if (existing) {
      existing.remove()
    }
  }
}

function getSchemaType(category = '') {
  const cat = category.toLowerCase()
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('bakery') || cat.includes('cafe')) {
    return 'Restaurant'
  }
  if (cat.includes('hotel') || cat.includes('resort') || cat.includes('travel') || cat.includes('lodging')) {
    return 'Hotel'
  }
  if (cat.includes('fashion') || cat.includes('clothing') || cat.includes('shoes') || cat.includes('tech') || cat.includes('electronics') || cat.includes('repair')) {
    return 'Store'
  }
  if (cat.includes('beauty') || cat.includes('salon') || cat.includes('spa') || cat.includes('barber')) {
    return 'BeautySalon'
  }
  return 'LocalBusiness'
}

function setMetaTag(attributeName, attributeValue, content) {
  let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attributeName, attributeValue)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}
