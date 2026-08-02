import { useState, useEffect } from 'react'
import BusinessCard from '../components/BusinessCard'
import {
  searchBusinesses,
  getAllBusinesses,
} from '../services/businessService'
import { understandSearch, getSuggestedCategories } from '../services/openrouterService'
import { useAuth } from '../context/AuthContext'

export default function FinderDashboard() {
  const { profile } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [results, setResults] = useState([])
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [intent, setIntent] = useState('')
  const [usedAI, setUsedAI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [initial, setInitial] = useState([])
  const [categories] = useState(getSuggestedCategories())

  useEffect(() => {
    getAllBusinesses().then(setInitial).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setAiSuggestions([])

    try {
      // AI understands the natural language query
      const ai = await understandSearch(query.trim())
      setIntent(ai.intent)
      setUsedAI(ai.usedAI)
      setAiSuggestions(ai.aiSuggestions || [])

      const pickedCategory = ai.category || category
      const keyword =
        ai.keywords && ai.keywords.length ? ai.keywords.join(' ') : query

      // "Inside" search — our local Firestore database
      const local = await searchBusinesses({
        category: pickedCategory,
        keyword,
      })

      // Merge AI suggestions that don't already exist locally
      const existing = new Set(local.map((b) => b.name?.toLowerCase()))
      const outside = (ai.aiSuggestions || [])
        .filter((s) => !existing.has(s.name?.toLowerCase()))
        .map((s, i) => ({
          id: `ai-${i}`,
          isAI: true,
          name: s.name,
          category: s.category,
          description: s.description,
          reason: s.reason,
        }))

      setResults([...local, ...outside])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategory = async (cat) => {
    setCategory(cat)
    setQuery('')
    setSearched(true)
    setLoading(true)
    setAiSuggestions([])
    setIntent('')
    try {
      const local = await searchBusinesses({ category: cat })
      setResults(local)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>
          Hi, {profile?.name?.split(' ')[0]} 👋
        </h1>
        <p>What are you looking for today?</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Try: best barber near me, pizza place, nail salon…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="category-row">
        <button
          className={`chip-chip ${category === '' ? 'chip-chip-active' : ''}`}
          onClick={() => handleCategory('')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip-chip ${category === c ? 'chip-chip-active' : ''}`}
            onClick={() => handleCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {searched && intent && usedAI && (
        <p className="intent-line">
          🤖 I understood that as: <em>“{intent}”</em>
        </p>
      )}

      {loading && <p className="center-loading">Searching…</p>}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">
          <p>No businesses found yet. Try a different word, or be the first
          business to register.</p>
        </div>
      )}

      {!searched && (
        <div className="section">
          <h2 className="section-title">Latest businesses</h2>
          {initial.length === 0 ? (
            <p className="muted">No businesses registered yet.</p>
          ) : (
            <div className="grid">
              {initial.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </div>
      )}

      {searched && results.length > 0 && (
        <div className="section">
          <h2 className="section-title">Results</h2>
          <div className="grid">
            {results.map((b) =>
              b.isAI ? (
                <div className="card card-ai" key={b.id}>
                  <div className="card-body">
                    <span className="chip chip-ai">🤖 AI suggestion</span>
                    <h3 className="card-title">{b.name}</h3>
                    <span className="chip">{b.category}</span>
                    <p className="card-desc">{b.description}</p>
                    {b.reason && (
                      <p className="card-reason">Why: {b.reason}</p>
                    )}
                    <p className="muted">
                      Not listed yet — tell this business to register!
                    </p>
                  </div>
                </div>
              ) : (
                <BusinessCard key={b.id} business={b} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
