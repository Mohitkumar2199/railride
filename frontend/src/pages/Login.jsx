import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginUser(form)
      login(data)
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-icon">🚂</div>
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Login to access your bookings</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field mb-4">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-field mb-4">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ padding: 13, fontSize: 15 }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
        <div className="auth-divider" />
        <p className="text-center text-sm text-muted">
          Don't have an account? <Link to="/register" className="auth-link">Create account</Link>
        </p>
        <p className="text-center text-xs text-muted mt-2">
          Demo admin: <strong>admin@railride.com</strong> / <strong>Admin@123</strong>
        </p>
      </div>
    </div>
  )
}
