import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  createBusiness,
  updateBusiness,
  getBusinessByOwner,
} from '../services/businessService'
import { uploadImage } from '../services/cloudinaryService'
import { getSuggestedCategories } from '../services/openrouterService'

function ImagePicker({ label, file, url, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        className="form-control"
        onChange={(e) => onChange(e.target.files[0])}
      />
      {url && (
        <img
          src={url}
          alt={label}
          style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', marginTop: '8px' }}
        />
      )}
      {!url && file && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Selected: {file.name}</p>}
    </div>
  )
}

export default function BusinessSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const categories = getSuggestedCategories()

  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [img1, setImg1] = useState(null)
  const [img1Url, setImg1Url] = useState('')
  const [img2, setImg2] = useState(null)
  const [img2Url, setImg2Url] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getBusinessByOwner(user.uid).then((b) => {
      if (b) {
        setEditingId(b.id)
        setName(b.name || '')
        setCategory(b.category || '')
        setLocation(b.location || b.city || '')
        setPhone(b.phone || '')
        setPrice(b.price || '')
        setDescription(b.description || '')
        setLogoUrl(b.logoUrl || '')
        setImg1Url(b.image1Url || '')
        setImg2Url(b.image2Url || '')
      }
    })
  }, [user.uid])

  const upload = async (file) => {
    if (!file) return ''
    const res = await uploadImage(file)
    return res.url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('Business name is required.')
    if (!logo && !logoUrl) return setError('Please add a business logo.')

    setUploading(true)
    setSaving(true)
    try {
      const [l, i1, i2] = await Promise.all([
        upload(logo),
        upload(img1),
        upload(img2),
      ])
      const data = {
        name: name.trim(),
        category,
        location: location.trim() || 'Lagos',
        city: location.trim() || 'Lagos',
        phone: phone.trim(),
        price: price.trim(),
        description: description.trim(),
        logoUrl: l || logoUrl,
        image1Url: i1 || img1Url,
        image2Url: i2 || img2Url,
        verified: true,
        keywords: [
          name.trim().toLowerCase(),
          category.toLowerCase(),
          location.trim().toLowerCase(),
        ].filter(Boolean),
      }

      if (editingId) {
        await updateBusiness(editingId, data)
      } else {
        await createBusiness({ uid: user.uid, data })
      }
      navigate('/business')
    } catch (err) {
      console.error(err)
      setError('Could not save. Check Cloudinary settings or try again.')
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  return (
    <div className="setup-card">
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
        {editingId ? 'Edit business listing' : 'List your business on Dotch'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Get discovered by customers searching for your products and services around you.
      </p>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Business Name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kicks Hub Lagos"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>City / Location</label>
          <input
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lekki, Lagos or Asaba"
            required
          />
        </div>

        <div className="form-group">
          <label>WhatsApp / Phone Number</label>
          <input
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +2348012345678"
          />
        </div>

        <div className="form-group">
          <label>Price Range (Optional)</label>
          <input
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. ₦10,000 - ₦50,000"
          />
        </div>

        <div className="form-group">
          <label>Description & Services Offered</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what products/services you sell. This helps AI find your store."
            rows={3}
          />
        </div>

        <ImagePicker label="Business Logo" file={logo} url={logoUrl} onChange={setLogo} />
        <ImagePicker label="Product Photo 1" file={img1} url={img1Url} onChange={setImg1} />
        <ImagePicker label="Product Photo 2" file={img2} url={img2Url} onChange={setImg2} />

        <button className="btn btn-primary btn-block" disabled={uploading || saving} style={{ marginTop: '16px' }}>
          {uploading ? 'Uploading images…' : saving ? 'Saving…' : editingId ? 'Save listing' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
