import { useState, useEffect } from 'react'
import { CAMPAIGN_PACKAGES, createCampaignAd } from '../services/adService'
import { initializePaystackCampaignCheckout } from '../services/paystackService'
import { BANK_DETAILS, getPaymentWhatsAppUrl } from '../config/bankDetails'
import { useToast } from '../context/ToastContext'
import { uploadImage, fileToBase64 } from '../services/cloudinaryService'
import PhoneInput from './PhoneInput'
import { formatTo234 } from '../utils/phoneUtils'

export default function CampaignCreatorModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  userProfile,
  business,
}) {
  const { showSuccess, showError } = useToast()

  const [selectedPkgId, setSelectedPkgId] = useState('flash_3d') // ₦250 for 3 days
  const [title, setTitle] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')
  const [pricePromo, setPricePromo] = useState('')
  const [ctaText, setCtaText] = useState('Order on WhatsApp')
  const [targetReach, setTargetReach] = useState('Nationwide Delivery')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('whatsapp') // 'whatsapp' or 'paystack'

  const [uploadingImg, setUploadingImg] = useState(false)
  const [processingPay, setProcessingPay] = useState(false)

  // Auto-fill from business or user profile
  useEffect(() => {
    if (business) {
      setBusinessName(business.name || '')
      setCategory(business.category || '')
      setPhone(business.phone || userProfile?.phone || '')
      if (business.image1Url || business.logoUrl) {
        setImageUrl(business.image1Url || business.logoUrl)
      }
    } else if (userProfile) {
      setBusinessName(userProfile.name || '')
      setPhone(userProfile.phone || '')
    }
  }, [business, userProfile])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  if (!isOpen) return null

  const selectedPkg = CAMPAIGN_PACKAGES.find((p) => p.id === selectedPkgId) || CAMPAIGN_PACKAGES[0]

  const whatsappInquiryUrl = getPaymentWhatsAppUrl({
    email: currentUser?.email,
    planName: selectedPkg.name,
    planAmount: selectedPkg.formattedPrice,
    vendorName: businessName || userProfile?.name,
    campaignTitle: title || 'Spotlight Ad',
  })

  const handleFinalizeAdCreation = async (paymentRef, method = 'whatsapp') => {
    let finalImg = imageUrl
    if (imageFile) {
      setUploadingImg(true)
      try {
        const uploaded = await uploadImage(imageFile)
        finalImg = uploaded || (await fileToBase64(imageFile))
      } catch (err) {
        console.warn('Image upload fallback to base64:', err)
        finalImg = await fileToBase64(imageFile)
      } finally {
        setUploadingImg(false)
      }
    }

    if (!finalImg) {
      finalImg = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop'
    }

    const created = await createCampaignAd({
      title: title || `${businessName} Special Promotion`,
      businessName: businessName || 'Verified Dotch Seller',
      businessId: business?.id || null,
      category: category || business?.category || 'General',
      placement: selectedPkg.placement || 'hero_banner',
      badge: 'Sponsored',
      imageUrl: finalImg,
      flyerUrl: finalImg,
      tagline: title || `${businessName} on Dotch`,
      phone: formatTo234(phone),
      targetReach,
      pricePromo: pricePromo || selectedPkg.formattedPrice,
      ctaText: ctaText || 'Order on WhatsApp',
      packageId: selectedPkg.id,
      userId: currentUser?.uid || 'guest',
      paymentMethod: method,
      paymentReference: paymentRef,
    })

    showSuccess(`🎉 Campaign ad registered! Your ad will be activated for ${selectedPkg.days} days upon payment confirmation.`)
    if (onSuccess) onSuccess(created)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      showError('Please enter an ad headline or title.')
      return
    }
    if (!businessName.trim()) {
      showError('Please provide your business or brand name.')
      return
    }
    if (!phone.trim()) {
      showError('Please provide your WhatsApp contact number.')
      return
    }

    setProcessingPay(true)

    // Option 1: WhatsApp Admin flow for account number
    if (paymentMethod === 'whatsapp') {
      const transferRef = `wa_ref_${Date.now()}`
      try {
        await handleFinalizeAdCreation(transferRef, 'whatsapp_admin')
        // Automatically open WhatsApp chat with admin
        if (typeof window !== 'undefined') {
          window.open(whatsappInquiryUrl, '_blank')
        }
      } catch (err) {
        showError('Could not register campaign: ' + (err.message || 'Unknown error'))
      } finally {
        setProcessingPay(false)
      }
      return
    }

    // Option 2: Paystack Online Checkout Flow
    try {
      await initializePaystackCampaignCheckout({
        email: currentUser?.email || 'customer@dotch.ng',
        amount: selectedPkg.price,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        adTitle: title,
        businessName,
        onSuccess: async (res) => {
          try {
            await handleFinalizeAdCreation(res.reference, 'paystack')
          } catch (createErr) {
            console.error('Error creating campaign after payment:', createErr)
            showError('Payment received! Finalizing campaign registration...')
          } finally {
            setProcessingPay(false)
          }
        },
        onClose: () => {
          setProcessingPay(false)
        },
      })
    } catch (err) {
      console.error('Paystack checkout initialization failed:', err)
      showError('Online checkout unavailable. Message admin on WhatsApp for account number.')
      setProcessingPay(false)
    }
  }

  const displaySrc = imagePreview || imageUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop'

  return (
    <div className="campaign-modal-backdrop" onClick={onClose}>
      <div className="campaign-modal-card campaign-modal-bold" onClick={(e) => e.stopPropagation()}>
        {/* Bold Modal Header */}
        <div className="campaign-modal-header bold-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="campaign-glow-pill">
                <i className="fa-solid fa-bolt" /> ₦250 Micro-Campaign
              </span>
              <span className="campaign-top-badge">
                🔥 Top Homepage Visibility
              </span>
            </div>
            <h2 className="campaign-modal-bold-title">
              Launch High-Converting Campaign Banner
            </h2>
            <p className="campaign-modal-bold-subtitle">
              Put your brand flyer or discount deal at the very top of the homepage hero carousel and discovery stream.
            </p>
          </div>
          <button
            type="button"
            className="campaign-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="campaign-modal-body">
          {/* STEP 1: SELECT PACKAGE WITH BOLD CARDS */}
          <div style={{ marginBottom: '22px' }}>
            <label className="campaign-label-bold" style={{ marginBottom: '10px', display: 'block' }}>
              <i className="fa-solid fa-fire" style={{ marginRight: '6px', color: 'var(--brand-primary)' }} />
              Select Campaign Package:
            </label>
            <div className="campaign-packages-grid bold-grid">
              {CAMPAIGN_PACKAGES.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id
                return (
                  <div
                    key={pkg.id}
                    className={`campaign-pkg-card-bold ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPkgId(pkg.id)}
                  >
                    <div className="pkg-card-top-row">
                      <span className="pkg-badge-bold">{pkg.badge}</span>
                      <div className={`pkg-radio-circle ${isSelected ? 'active' : ''}`}>
                        {isSelected && <span className="pkg-radio-dot" />}
                      </div>
                    </div>
                    <h3 className="pkg-bold-name">{pkg.name}</h3>
                    <div className="pkg-bold-price">
                      <span className="pkg-price-num">{pkg.formattedPrice}</span>
                      <span className="pkg-price-interval">{pkg.interval}</span>
                    </div>
                    <p className="pkg-bold-desc">{pkg.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* STEP 2: CAMPAIGN CONTENT DETAILS */}
          <div className="campaign-form-section bold-section">
            <h3 className="campaign-section-title-bold">
              <i className="fa-solid fa-pen-nib" style={{ marginRight: '6px', color: 'var(--brand-primary)' }} />
              Ad Banner Information
            </h3>

            <div className="campaign-fields-grid">
              <div className="form-group">
                <label>Headline / Catchy Offer *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 50% Off Designer Sneakers & Shoes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Store or Brand Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Kicks Hub Lagos"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Promo Tag / Deal Badge</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. From ₦12,000 or Save 25%"
                  value={pricePromo}
                  onChange={(e) => setPricePromo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>WhatsApp Hotline Phone *</label>
                <PhoneInput
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  required
                />
              </div>

              <div className="form-group">
                <label>WhatsApp Button Label</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Order on WhatsApp, Claim Deal"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Target Delivery / Coverage Area</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Nationwide Delivery, Lagos & Abuja"
                  value={targetReach}
                  onChange={(e) => setTargetReach(e.target.value)}
                />
              </div>
            </div>

            {/* Banner Photo Upload or URL */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Banner Graphic or Flyer Photo (Landscape recommended)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'center' }}>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0])
                      }
                    }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Upload image from device (JPEG, PNG, WebP)
                  </small>
                </div>
                <div>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Or paste image URL https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: LIVE AD BANNER PREVIEW */}
          <div className="campaign-preview-container bold-preview">
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
              👀 Live Homepage Banner Preview:
            </span>
            <div className="campaign-live-preview-card">
              <div className="preview-img-wrap">
                <img src={displaySrc} alt="Preview" className="preview-img" />
                <span className="preview-badge-pill">🔥 Sponsored • {selectedPkg.name}</span>
                {pricePromo && <span className="preview-price-tag">{pricePromo}</span>}
              </div>
              <div className="preview-content">
                <h4 className="preview-title">{title || 'Your Eye-Catching Ad Headline'}</h4>
                <p className="preview-sub">{businessName || 'Your Business Name'} · {targetReach}</p>
                <div className="preview-cta-btn">
                  <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px' }} />
                  {ctaText || 'Chat on WhatsApp'}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: PAYMENT OPTIONS (NO TYPED ACCOUNT NUMBER) */}
          <div className="campaign-payment-section bold-payment">
            <h3 className="campaign-section-title-bold">
              <i className="fa-solid fa-credit-card" style={{ marginRight: '6px', color: 'var(--brand-primary)' }} />
              Payment & Activation: {selectedPkg.formattedPrice} ({selectedPkg.interval})
            </h3>

            <div className="payment-options-grid bold-options">
              {/* Option 1: WhatsApp Admin for Account Number */}
              <label
                className={`payment-option-card-bold ${paymentMethod === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('whatsapp')}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                />
                <div style={{ flex: 1 }}>
                  <strong>
                    <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '6px' }} />
                    Message Admin on WhatsApp for Account Number
                  </strong>
                  <p>Get official account details directly from admin ({BANK_DETAILS.formattedAdminWhatsApp}) & send receipt for instant verification</p>
                </div>
                <span className="payment-bold-tag">{selectedPkg.formattedPrice}</span>
              </label>

              {/* Option 2: Paystack Online Card/USSD Checkout */}
              <label
                className={`payment-option-card-bold ${paymentMethod === 'paystack' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paystack')}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="paystack"
                  checked={paymentMethod === 'paystack'}
                  onChange={() => setPaymentMethod('paystack')}
                />
                <div style={{ flex: 1 }}>
                  <strong>
                    <i className="fa-solid fa-bolt" style={{ color: 'var(--brand-primary)', marginRight: '6px' }} />
                    Instant Card / Online Checkout (Paystack)
                  </strong>
                  <p>Debit Card, Apple Pay, USSD (Instant Automated Launch)</p>
                </div>
                <span className="payment-bold-tag">{selectedPkg.formattedPrice}</span>
              </label>
            </div>

            {/* Explanatory callout for WhatsApp flow */}
            {paymentMethod === 'whatsapp' && (
              <div className="wa-payment-callout-bold">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>
                      Admin WhatsApp Line: {BANK_DETAILS.formattedAdminWhatsApp}
                    </strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Tapping Launch below will save your banner and open WhatsApp directly with your campaign details to request the official payment account number.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="campaign-modal-actions bold-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={processingPay || uploadingImg}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-launch-bold"
              disabled={processingPay || uploadingImg}
            >
              {processingPay || uploadingImg ? (
                <>⏳ Registering Ad...</>
              ) : paymentMethod === 'whatsapp' ? (
                <>🚀 Chat Admin for Account # & Launch ({selectedPkg.formattedPrice}) →</>
              ) : (
                <>🚀 Pay {selectedPkg.formattedPrice} & Launch Campaign →</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
