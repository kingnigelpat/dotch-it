import { useState } from 'react'
import PhoneInput from './PhoneInput'

export default function AuthForm({ title, subtitle, fields, onSubmit, submitLabel, error, loading, children, onValuesChange }) {
  const [values, setValues] = useState(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}),
  )
  const [showPasswords, setShowPasswords] = useState({})

  const togglePassword = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="auth-card">
      <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{subtitle}</p>}
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        {fields.map((f) => {
          const isPassword = f.type === 'password'
          const isPhone = f.type === 'tel' || f.name === 'phone'
          const isVisible = Boolean(showPasswords[f.name])

          if (isPhone) {
            return (
              <div className="form-group" key={f.name}>
                <label htmlFor={f.name}>{f.label}</label>
                <PhoneInput
                  id={f.name}
                  name={f.name}
                  value={values[f.name]}
                  required={f.required !== false}
                  placeholder={f.placeholder || '801 234 5678'}
                  onChange={(val) => {
                    setValues((v) => {
                      const next = { ...v, [f.name]: val }
                      if (onValuesChange) onValuesChange(next)
                      return next
                    })
                  }}
                />
              </div>
            )
          }

          return (
            <div className="form-group" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <div className="password-input-wrapper">
                <input
                  id={f.name}
                  name={f.name}
                  className="form-control"
                  type={isPassword ? (isVisible ? 'text' : 'password') : (f.type || 'text')}
                  placeholder={f.placeholder || ''}
                  required={f.required !== false}
                  value={values[f.name]}
                  style={isPassword ? { paddingRight: '46px' } : undefined}
                  onChange={(e) => {
                    const val = e.target.value
                    setValues((v) => {
                      const next = { ...v, [f.name]: val }
                      if (onValuesChange) onValuesChange(next)
                      return next
                    })
                  }}
                />
                {isPassword && (
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePassword(f.name)}
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    title={isVisible ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {isVisible ? (
                      /* Eye with line (Hide) */
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      /* Eye open (Show) */
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {children}
        <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '16px' }}>
          {loading ? 'Please wait…' : submitLabel}
        </button>
      </form>
    </div>
  )
}
