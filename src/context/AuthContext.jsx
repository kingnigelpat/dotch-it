import { createContext, useContext, useState, useEffect } from 'react'
import {
  watchAuth,
  getUserProfile,
  logoutUser,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('dotch_view_mode') || null
  })

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

  const logout = async () => {
    await logoutUser()
    setUser(null)
    setProfile(null)
    switchViewMode('explorer')
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
        viewMode: viewMode || (profile?.role === 'vendor' || profile?.role === 'business' ? 'business' : 'explorer'),
        switchViewMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
