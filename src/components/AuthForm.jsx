import { useState } from 'react'

export default function AuthForm({ title, subtitle, fields, onSubmit, submitLabel, error, loading, children }) {
  const [values, setValues] = useState(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}),
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">{title}</h2>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          {fields.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <input
                id={f.name}
                name={f.name}
                type={f.type || 'text'}
                placeholder={f.placeholder || ''}
                required={f.required !== false}
                value={values[f.name]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              />
            </div>
          ))}
          {children}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait…' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
