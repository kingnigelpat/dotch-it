import { isFirebaseConfigured } from '../firebase'

export default function SetupNotice() {
  if (!import.meta.env.DEV || isFirebaseConfigured) return null

  return (
    <div className="setup-notice">
      <strong>⚠️ Setup needed:</strong> add Firebase keys to your <code>.env</code> file, then restart with <code>npm run dev</code>.
    </div>
  )
}

