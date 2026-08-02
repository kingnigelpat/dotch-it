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
    <div className="field">
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files[0])}
      />
      {url && <img src={url} alt={label} className="preview" />}
      {!url && file && <p className="muted">Selected: {file.name}</p>}
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
    if (!img1 && !img1Url) return setError('Please add at least the first photo.')
    if (!img2 && !img2Url) return setError('Please add the second photo.')

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
        description: description.trim(),
        logoUrl: l || logoUrl,
        image1Url: i1 || img1Url,
        image2Url: i2 || img2Url,
        keywords: [name.trim().toLowerCase(), category.toLowerCase()].filter(Boolean),
      }

      if (editingId) {
        await updateBusiness(editingId, data)
      } else {
        await createBusiness({ uid: user.uid, data })
      }
      navigate('/business')
    } catch (err) {
      console.error(err)
      setError('Could not save. Check your Cloudinary keys and try again.')
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{editingId ? 'Edit your business' : 'Set up your business'}</h1>
        <p>Your name, logo and two photos are what finders will see.</p>
      </div>

      <form className="setup-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label>Business name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Joe's Pizza"
            required
          />
        </div>

        <div className="field">
          <label>Category</label>
          <select
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

        <div className="field">
          <label>Short description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you offer? This helps AI find you."
            rows={3}
          />
        </div>

        <ImagePicker label="Logo" file={logo} url={logoUrl} onChange={setLogo} />
        <ImagePicker label="Photo 1 (product or service)" file={img1} url={img1Url} onChange={setImg1} />
        <ImagePicker label="Photo 2 (product or service)" file={img2} url={img2Url} onChange={setImg2} />

        <button className="btn btn-primary btn-block" disabled={uploading || saving}>
          {uploading
            ? 'Uploading images…'
            : saving
              ? 'Saving…'
              : editingId
                ? 'Save changes'
                : 'Create business'}
        </button>
      </form>
    </div>
  )
}
