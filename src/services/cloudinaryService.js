// Cloudinary Image Upload Service for DOTCH
// Uses unsigned upload preset — NO secret API keys exposed to the client.

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dohfg4cin'
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'thesearch'

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset)

/**
 * Upload an image to Cloudinary using an unsigned upload preset.
 * @param {File|Blob} file 
 * @returns {Promise<{ url: string, publicId: string }>}
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

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  let res
  try {
    res = await fetch(url, { method: 'POST', body: formData })
  } catch (netErr) {
    console.error('Cloudinary network connection error:', netErr)
    throw new Error('Network error: Unable to connect to image upload server. Please check your internet connection.')
  }

  if (!res.ok) {
    let message = 'Image upload failed.'
    try {
      const errData = await res.json()
      if (errData?.error?.message) {
        if (errData.error.message.toLowerCase().includes('preset not found')) {
          message = `Cloudinary preset "${uploadPreset}" not found. Please ensure an unsigned preset named "${uploadPreset}" exists in your Cloudinary console.`
        } else {
          message = errData.error.message
        }
      }
    } catch {
      try {
        const text = await res.text()
        if (text) message += ` (${text.slice(0, 120)})`
      } catch {
        // ignore
      }
    }
    console.error('Cloudinary upload failure:', message)
    throw new Error(message)
  }

  const data = await res.json()
  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
  }
}

