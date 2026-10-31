import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Check if WebGL is available on this browser/device
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Fallback CSS Animated Gradient Orb if WebGL is not available
 */
function CssGradientOrb({ isThinking, isTyping }) {
  return (
    <div className={`css-orb-wrap ${isThinking ? 'thinking' : ''} ${isTyping ? 'typing' : ''}`}>
      <div className="css-orb-outer-glow" />
      <div className="css-orb-core">
        <div className="css-orb-specular" />
      </div>
      <div className="css-orb-rings" />
    </div>
  )
}

/**
 * Interactive 3D Animated Orb Hero
 * 
 * - Floats and moves gently
 * - Reacts smoothly to mouse movement
 * - Glows brighter when the buyer is typing
 * - Pulses faster with energetic waves while "thinking"
 * - Lightweight & runs at 60fps on mid-range devices
 * - Graceful fallback to CSS gradient orb if WebGL unavailable
 */
export default function AiDiscoveryOrb({ isThinking = false, isTyping = false }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [webGlSupported] = useState(() => isWebGLAvailable())

  useEffect(() => {
    if (!webGlSupported || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current

    let animationFrameId
    let isDisposed = false

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth || 320
    const height = container.clientHeight || 320

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 6.2

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    } catch (e) {
      console.warn('WebGL init failed, fallback will be used:', e)
      return
    }

    // Orb Group (for floating & mouse orientation)
    const orbGroup = new THREE.Group()
    scene.add(orbGroup)

    // 1. Inner Luminous Core
    const coreGeometry = new THREE.IcosahedronGeometry(1.5, 4)
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xee5d36, // Dotch coral
      emissive: 0xd9441a,
      emissiveIntensity: 0.8,
      roughness: 0.18,
      metalness: 0.25,
      flatShading: false,
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    orbGroup.add(coreMesh)

    // 2. Translucent Inner Shell with Fresnel feel
    const shellGeometry = new THREE.SphereGeometry(1.68, 32, 32)
    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xfa5e2d,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
    })
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial)
    orbGroup.add(shellMesh)

    // 3. Floating Geometric Energy Cage (Dual Wireframes)
    const wireGeo1 = new THREE.IcosahedronGeometry(1.95, 2)
    const wireMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Cyan energy rim
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const wireMesh1 = new THREE.Mesh(wireGeo1, wireMat1)
    orbGroup.add(wireMesh1)

    const wireGeo2 = new THREE.OctahedronGeometry(2.15, 2)
    const wireMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Warm gold accent
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    })
    const wireMesh2 = new THREE.Mesh(wireGeo2, wireMat2)
    orbGroup.add(wireMesh2)

    // 4. Ambient Orbital Particle Field
    const particleCount = 120
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.3 + Math.random() * 0.9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = radius * Math.cos(phi)
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    orbGroup.add(particleSystem)

    // 5. Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0x221814, 1.8)
    scene.add(ambientLight)

    const mainPointLight = new THREE.PointLight(0xff7744, 3.2, 12)
    mainPointLight.position.set(3.5, 3.0, 4.0)
    scene.add(mainPointLight)

    const cyanRimLight = new THREE.PointLight(0x38bdf8, 2.2, 12)
    cyanRimLight.position.set(-3.5, -2.5, 3.5)
    scene.add(cyanRimLight)

    const backGlowLight = new THREE.PointLight(0xf43f5e, 2.0, 10)
    backGlowLight.position.set(0, 0, -3.5)
    scene.add(backGlowLight)

    // Mouse Tracking with smooth interpolation
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2)
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2)
      
      const relX = (clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
      const relY = (clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)

      mouseX = Math.max(-1, Math.min(1, relX))
      mouseY = Math.max(-1, Math.min(1, relY))
      targetRotationY = mouseX * 0.75
      targetRotationX = mouseY * 0.75
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    // Resize Observer for flawless responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || isDisposed) return
      const entry = entries[0]
      const newWidth = Math.max(200, entry.contentRect.width)
      const newHeight = Math.max(200, entry.contentRect.height)
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    })
    resizeObserver.observe(container)

    // Animation Clock
    const clock = new THREE.Clock()

    // Smooth state transition values
    let currentEmissiveIntensity = 0.8
    let currentScale = 1.0

    const animate = () => {
      if (isDisposed) return
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Target parameters depending on state
      let targetEmissive = 0.8
      let targetLightIntensity = 3.2
      let speedMultiplier = 1.0
      let pulseMagnitude = 0.05
      let pulseFrequency = 2.0

      if (isThinking) {
        // Thinking state: pulses rapidly, energetic waves, fast rotation
        speedMultiplier = 3.6
        targetEmissive = 2.0 + Math.sin(elapsedTime * 14) * 0.5
        targetLightIntensity = 5.5 + Math.sin(elapsedTime * 12) * 1.5
        pulseMagnitude = 0.14
        pulseFrequency = 12.0
      } else if (isTyping) {
        // Typing state: glows significantly more, warm presence
        speedMultiplier = 1.4
        targetEmissive = 1.6
        targetLightIntensity = 4.8
        pulseMagnitude = 0.08
        pulseFrequency = 3.5
      }

      // Smooth lerp emissive & lighting
      currentEmissiveIntensity += (targetEmissive - currentEmissiveIntensity) * 0.1
      coreMaterial.emissiveIntensity = currentEmissiveIntensity
      mainPointLight.intensity = targetLightIntensity

      // Sinusoidal floating animation
      const floatY = Math.sin(elapsedTime * pulseFrequency * 0.7) * (isThinking ? 0.22 : 0.12)
      orbGroup.position.y = floatY

      // Pulse scaling
      const targetScaleVal = 1.0 + Math.sin(elapsedTime * pulseFrequency) * pulseMagnitude
      currentScale += (targetScaleVal - currentScale) * 0.15
      orbGroup.scale.set(currentScale, currentScale, currentScale)

      // Rotations
      orbGroup.rotation.y += (targetRotationY - orbGroup.rotation.y) * 0.06 + 0.008 * speedMultiplier
      orbGroup.rotation.x += (targetRotationX - orbGroup.rotation.x) * 0.06

      // Counter-rotating outer elements
      wireMesh1.rotation.y -= 0.012 * speedMultiplier
      wireMesh1.rotation.z += 0.008 * speedMultiplier
      wireMesh2.rotation.x += 0.015 * speedMultiplier
      wireMesh2.rotation.y += 0.01 * speedMultiplier

      particleSystem.rotation.y += 0.006 * speedMultiplier
      particleSystem.rotation.x -= 0.004 * speedMultiplier

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      isDisposed = true
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', handlePointerMove)
      resizeObserver.disconnect()

      // Thorough WebGL resource disposal
      coreGeometry.dispose()
      coreMaterial.dispose()
      shellGeometry.dispose()
      shellMaterial.dispose()
      wireGeo1.dispose()
      wireMat1.dispose()
      wireGeo2.dispose()
      wireMat2.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [webGlSupported, isThinking, isTyping])

  if (!webGlSupported) {
    return <CssGradientOrb isThinking={isThinking} isTyping={isTyping} />
  }

  return (
    <div
      ref={containerRef}
      className={`ai-orb-hero-container ${isThinking ? 'is-thinking' : ''} ${isTyping ? 'is-typing' : ''}`}
      aria-label="Dotch Interactive AI Discovery Orb"
    >
      <div className="ai-orb-ambient-halo" />
      <canvas ref={canvasRef} className="ai-orb-canvas" />
    </div>
  )
}
