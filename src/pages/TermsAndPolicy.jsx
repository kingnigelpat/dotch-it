import { Link } from 'react-router-dom'
import { TERMS_AND_POLICY } from '../data/termsAndPolicy'
import { BANK_DETAILS } from '../config/bankDetails'

export default function TermsAndPolicy() {
  return (
    <div style={{ maxWidth: '780px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ fontSize: '13.5px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          ← Back to Dotch
        </Link>
        <span className="badge-pill explorer-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
          Official Policy
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Vendor Terms of Service & Policy
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Please review the operating terms, payment verification procedures, and policies for listing your business on Dotch.
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.03) 100%)',
            border: '1.5px solid rgba(249, 115, 22, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '28px',
          }}
        >
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            🏦 Official Payment Account Notice:
          </strong>
          <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            All vendor subscription fees must be paid only to: <strong>{BANK_DETAILS.bankName}</strong> •{' '}
            <strong style={{ fontFamily: 'monospace', color: 'var(--brand-primary)' }}>{BANK_DETAILS.accountNumber}</strong> •{' '}
            {BANK_DETAILS.accountName}. For support and receipts:{' '}
            <a
              href={`https://wa.me/${(BANK_DETAILS.adminWhatsApp || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '12px', marginLeft: '4px' }}
            >
              Chat on WhatsApp
            </a>
          </span>
        </div>

        {TERMS_AND_POLICY.sections.map((sec) => (
          <div key={sec.id} style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {sec.title}
            </h3>
            <ul style={{ paddingLeft: '22px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {sec.content.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Last Updated: {TERMS_AND_POLICY.lastUpdated}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/subscription" className="btn btn-outline btn-sm">
              View Plans & Pricing
            </Link>
            <Link to="/register?role=vendor" className="btn btn-primary btn-sm">
              Register Business →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
