import { useState, useEffect } from 'react'
import { extractNationalDigits, formatNationalDigits } from '../utils/phoneUtils'

/**
 * PhoneInput Component with fixed Nigerian country code (+234 🇳🇬)
 *
 * Automatically handles:
 * - Leading 0 trimming (e.g. typing 08012345678 instantly becomes 801 234 5678)
 * - Pasting international (+234) or local numbers seamlessly
 * - Calling onChange with full E.164 format (+2348012345678) right away
 */
export default function PhoneInput({
  id,
  name,
  value = '',
  onChange,
  required = false,
  placeholder = '801 234 5678',
  disabled = false,
  className = '',
  style,
  autoFocus = false,
}) {
  const [displayValue, setDisplayValue] = useState(() => {
    const nat = extractNationalDigits(value)
    return formatNationalDigits(nat)
  })

  useEffect(() => {
    const nat = extractNationalDigits(value)
    setDisplayValue(formatNationalDigits(nat))
  }, [value])

  const handleInputChange = (e) => {
    const raw = e.target.value
    const nat = extractNationalDigits(raw)
    // Nigerian mobile numbers are 10 digits after +234
    const limited = nat.slice(0, 10)
    const formatted = formatNationalDigits(limited)
    setDisplayValue(formatted)

    if (onChange) {
      const full = limited ? `+234${limited}` : ''
      onChange(full)
    }
  }

  const rawNational = extractNationalDigits(displayValue)
  const fullValue = rawNational ? `+234${rawNational}` : ''

  return (
    <div className={`phone-input-wrapper ${className}`.trim()} style={style}>
      <div className="phone-prefix-addon" title="Nigeria (+234)">
        <span className="phone-prefix-flag" aria-hidden="true">🇳🇬</span>
        <span className="phone-prefix-code">+234</span>
      </div>
      <input
        type="tel"
        id={id}
        className="phone-input-field"
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="tel-national"
        inputMode="numeric"
      />
      {name && <input type="hidden" name={name} value={fullValue} />}
    </div>
  )
}
