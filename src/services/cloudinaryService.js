const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset)

export async function uploadImage(file) {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.',
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const res = await fetch(url, { method: 'POST', body: formData })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Cloudinary upload failed: ' + text)
  }

  const data = await res.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
  }
}
