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

  useEffect(() => {
    const unsub = watchAuth(async (fbUser) => {
      try {
        if (fbUser) {
          const prof = await getUserProfile(fbUser.uid)
          setUser(fbUser)
          setProfile(prof)
        } else {
          setUser(null)
          setProfile(null)
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

  const logout = async () => {
    await logoutUser()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) setProfile(await getUserProfile(user.uid))
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
