import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => pathname === path ? 'navbar__link active' : 'navbar__link'

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        <div className="navbar__logo-icon">🚂</div>
        <span className="navbar__logo-text">Railride</span>
      </Link>

  <Link to="/" className={isActive('/')}>Search Trains</Link>
      <Link to="/ai" className={isActive('/ai')}>AI Features</Link>
      {user && <Link to="/bookings" className={isActive('/bookings')}>My Tickets</Link>}
      <Link to="/pnr" className={isActive('/pnr')}>PNR Status</Link>
      {user?.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>}

      {user ? (
        <>
      <button className="navbar__logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          <div className="navbar__avatar" title={user.name}>{user.name[0].toUpperCase()}</div>
        </>
      ) : (
        <>
          <Link to="/login" className={isActive('/login')}>Login</Link>
          <Link to="/register" className="navbar__link" style={{ color: 'var(--orange)', fontWeight: 700 }}>Register</Link>
        </>
      )}
    </nav>
  )
}
