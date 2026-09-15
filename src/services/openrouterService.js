const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
const model = import.meta.env.VITE_OPENROUTER_MODEL

export const isOpenRouterConfigured = Boolean(apiKey)

const SYSTEM_PROMPT = `You are the AI Search Engine Brain of "Dotch" (also known as "Just Dotch It"), a fast local business, product, and services discovery search engine.
Analyze natural language user searches (e.g., "Nike shoes around Lagos", "best pizza near Ikeja", "iPhone repair").

Rules:
- Always reply ONLY with a single JSON object. No markdown formatting.
- JSON structure:
{
  "category": "best matching category name from standard list (e.g. Fashion & Clothing, Restaurant, Electronics & Tech, Beauty & Salon, Auto Repair, Food & Drink)",
  "keywords": ["2 to 5 short keyword strings extracted from user query"],
  "location": "extracted location or city from query if present, otherwise empty string",
  "intent": "clean 1-line query summary (e.g. Nike Air Force 1 shoes)",
  "aiSuggestions": [
    { "name": "sample business name", "category": "category", "description": "short 1-line description of product/service", "reason": "why it matches" }
  ]
}
- Provide up to 2 realistic local business suggestions in aiSuggestions if applicable.
- If query is unclear, return empty strings.`

function extractJson(text) {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

export async function understandSearch(query, locationFilter = '') {
  if (!isOpenRouterConfigured) {
    return {
      category: '',
      keywords: query
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 2)
        .slice(0, 5),
      location: locationFilter,
      intent: query,
      aiSuggestions: [],
      usedAI: false,
    }
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Query: "${query}". Location context: "${locationFilter}"` },
        ],
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      throw new Error('OpenRouter HTTP ' + res.status)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = extractJson(content)

    return {
      category: parsed?.category || '',
      keywords: Array.isArray(parsed?.keywords)
        ? parsed.keywords.slice(0, 5)
        : [],
      location: parsed?.location || locationFilter,
      intent: parsed?.intent || query,
      aiSuggestions: Array.isArray(parsed?.aiSuggestions)
        ? parsed.aiSuggestions.slice(0, 3)
        : [],
      usedAI: true,
    }
  } catch (err) {
    console.warn('OpenRouter search parse fallback:', err)
    return {
      category: '',
      keywords: query
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 2)
        .slice(0, 5),
      location: locationFilter,
      intent: query,
      aiSuggestions: [],
      usedAI: false,
    }
  }
}

export function getSuggestedCategories() {
  return [
    'Restaurant',
    'Food & Drink',
    'Fashion & Clothing',
    'Beauty & Salon',
    'Electronics & Tech',
    'Auto Repair',
    'Supermarket & Grocery',
    'Fitness & Gym',
    'Pharmacy & Health',
    'Home & Furniture',
    'Real Estate',
    'Hotel & Travel',
    'Education & Tutoring',
    'Other',
  ]
}
