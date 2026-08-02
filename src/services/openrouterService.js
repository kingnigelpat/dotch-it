const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
const model = import.meta.env.VITE_OPENROUTER_MODEL

export const isOpenRouterConfigured = Boolean(apiKey)

const SYSTEM_PROMPT = `You are the search brain of a local business finder app called "Local Search".
You understand natural-language searches and help find businesses.

Rules:
- Always answer with ONLY a single valid JSON object, no markdown, no extra text.
- The JSON must have exactly this shape:
{
  "category": "the best matching category, or empty string if unknown",
  "keywords": ["2 to 5 short keyword strings a user would type to find this"],
  "intent": "one short sentence describing what the user wants",
  "aiSuggestions": [
    { "name": "suggested business name", "category": "category", "description": "short one-line description", "reason": "why this matches" }
  ]
}
- Use your general knowledge to give up to 3 aiSuggestions ("outside" results).
- If the query is gibberish, return empty strings and an empty aiSuggestions array.`

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

export async function understandSearch(query) {
  if (!isOpenRouterConfigured) {
    // Offline fallback: simple keyword splitting so search still works.
    return {
      category: '',
      keywords: query
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 2)
        .slice(0, 5),
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
          { role: 'user', content: `Search query: "${query}"` },
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
      intent: parsed?.intent || query,
      aiSuggestions: Array.isArray(parsed?.aiSuggestions)
        ? parsed.aiSuggestions.slice(0, 3)
        : [],
      usedAI: true,
    }
  } catch (err) {
    console.warn('OpenRouter failed, falling back to keyword split.', err)
    return {
      category: '',
      keywords: query
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 2)
        .slice(0, 5),
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
    'Cafe',
    'Bar',
    'Supermarket',
    'Grocery',
    'Fashion & Clothing',
    'Beauty & Salon',
    'Barbershop',
    'Fitness & Gym',
    'Pharmacy & Health',
    'Auto Repair',
    'Electronics & Tech',
    'Home & Furniture',
    'Real Estate',
    'Education & Tutoring',
    'Legal Services',
    'Financial Services',
    'Travel & Hotel',
    'Entertainment',
    'Other',
  ]
}
