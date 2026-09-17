import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  watchAuth,
  getUserProfile,
  logoutUser,
  sendVerificationEmail,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('dotch_view_mode') || null
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dotch_theme') || 'light'
  })

  // Apply theme to <html> element on mount + change
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem('dotch_theme', theme)
  }, [theme])

  useEffect(() => {
    const unsub = watchAuth(async (fbUser) => {
      try {
        if (fbUser) {
          const prof = await getUserProfile(fbUser.uid)
          setUser(fbUser)
          setProfile(prof)
          // Default view mode if not manually set
          setViewMode((prev) => {
            if (prev) return prev
            const defaultMode = (prof?.role === 'vendor' || prof?.role === 'business') ? 'business' : 'explorer'
            localStorage.setItem('dotch_view_mode', defaultMode)
            return defaultMode
          })
        } else {
          setUser(null)
          setProfile(null)
          setViewMode((prev) => prev || 'explorer')
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setUser(fbUser)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  const switchViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('dotch_view_mode', mode)
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
    setProfile(null)
    switchViewMode('explorer')
  }

  const reloadUser = async () => {
    if (auth?.currentUser) {
      await auth.currentUser.reload()
      setUser({ ...auth.currentUser })
      if (auth.currentUser.uid) {
        setProfile(await getUserProfile(auth.currentUser.uid))
      }
    }
  }

  const sendVerification = async () => {
    if (auth?.currentUser) {
      await sendVerificationEmail(auth.currentUser)
    }
  }

  const refreshProfile = async () => {
    if (user) setProfile(await getUserProfile(user.uid))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        refreshProfile,
        reloadUser,
        sendVerification,
        viewMode: viewMode || (profile?.role === 'vendor' || profile?.role === 'business' ? 'business' : 'explorer'),
        switchViewMode,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

