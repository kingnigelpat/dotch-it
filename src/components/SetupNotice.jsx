import { isFirebaseConfigured } from '../firebase'
import { isCloudinaryConfigured } from '../services/cloudinaryService'
import { isOpenRouterConfigured } from '../services/openrouterService'

export default function SetupNotice() {
  const missing = []
  if (!isFirebaseConfigured) missing.push('Firebase')
  if (!isCloudinaryConfigured) missing.push('Cloudinary')
  if (!isOpenRouterConfigured) missing.push('OpenRouter')

  if (missing.length === 0) return null

  return (
    <div className="setup-notice">
      <strong>⚠️ Setup needed:</strong> add keys for{' '}
      {missing.join(', ')} to your <code>.env</code> file, then restart
      with <code>npm run dev</code>.
    </div>
  )
}
