// Cloudinary Image Upload Service for DOTCH
// With automatic multi-preset trial and seamless local Base64 fallback.

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dohfg4cin'
const configuredPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'dotchit'

export const isCloudinaryConfigured = Boolean(cloudName && configuredPreset)

/**
 * Helper to convert a File to a Base64 Data URL (fallback when Cloudinary preset is missing)
 * @param {File|Blob} file 
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

/**
 * Upload an image to Cloudinary using an unsigned upload preset.
 * Fallback to Base64 data URL if Cloudinary preset is not configured/found.
 * @param {File|Blob} file 
 * @returns {Promise<{ url: string, publicId?: string }>}
 */
export async function uploadImage(file) {
  if (!file) {
    throw new Error('No image file selected.')
  }

  // Validate file type
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Selected file must be an image (JPEG, PNG, WEBP, etc.).')
  }

  // 10MB limit guard
  if (file.size && file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB. Please choose a smaller image.')
  }

  // Presets to try in sequence
  const presetsToTry = Array.from(new Set([configuredPreset, 'dotchit', 'ml_default', 'unsigned', 'thesearch']))

  for (const preset of presetsToTry) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', preset)

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const res = await fetch(url, { method: 'POST', body: formData })

      if (res.ok) {
        const data = await res.json()
        const secureUrl = data.secure_url || data.url
        if (secureUrl) {
          console.log(`Cloudinary upload successful using preset "${preset}"`)
          return {
            url: secureUrl,
            publicId: data.public_id,
          }
        }
      }
    } catch (err) {
      console.warn(`Cloudinary upload attempt failed with preset "${preset}":`, err)
    }
  }

  // If all Cloudinary preset attempts fail, fallback gracefully to Base64 Data URL
  console.info('Cloudinary upload unavailable or preset missing. Falling back to local Base64 image encoding.')
  try {
    const base64Url = await fileToBase64(file)
    return {
      url: base64Url,
      publicId: 'local_base64',
    }
  } catch (base64Err) {
    console.error('Failed to convert image to Base64:', base64Err)
    throw new Error('Could not process image file. Please try another image.')
  }
}
