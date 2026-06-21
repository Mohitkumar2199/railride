import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await registerUser(form)
      login(data)
      toast.success('Account created! Welcome to RailRide 🚂')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-icon">🎫</div>
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">Join RailRide and travel smarter</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field mb-3">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-field mb-3">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-field mb-3">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-field mb-4">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: 13, fontSize: 15 }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-divider" />
        <p className="text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  )
}
