import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🔍</span>
        <span>Local Search</span>
      </Link>

      <nav className="nav-links">
        {!user && (
          <>
            <Link to="/login" className="nav-link">
              Log in
            </Link>
            <Link to="/register" className="nav-link nav-cta">
              Create account
            </Link>
          </>
        )}
        {user && profile?.role === 'finder' && (
          <Link to="/dashboard" className="nav-link">
            Search
          </Link>
        )}
        {user && profile?.role === 'business' && (
          <Link to="/business" className="nav-link">
            My business
          </Link>
        )}
        {user && (
          <>
            <span className="nav-user">
              {profile?.name || user.email}
              {profile?.role === 'business' && (
                <span className="badge">business</span>
              )}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  )
}
