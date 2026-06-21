import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings, cancelBooking } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking PNR ${booking.pnr}? Refund will be processed in 5–7 days.`)) return
    setCancellingId(booking._id)
    try {
      await cancelBooking(booking._id)
      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'Cancelled', paymentStatus: 'Refunded' } : b))
      toast.success('Booking cancelled. Refund initiated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed')
    } finally {
      setCancellingId(null)
    }
  }

  const statusBadge = (s) => {
    const map = { Confirmed: 'badge-success', Cancelled: 'badge-danger', Waitlist: 'badge-warning', RAC: 'badge-blue' }
    return <span className={`badge ${map[s] || 'badge-blue'}`}>{s === 'Confirmed' ? '✓ Confirmed' : s}</span>
  }

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>My Bookings</h2>
            <p className="text-muted text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>+ New Booking</button>
        </div>

        {bookings.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state__icon">🎫</div>
            <div className="empty-state__title">No bookings yet</div>
            <div className="empty-state__text">Search for trains and book your first ticket</div>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Search Trains →</button>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking._id} className="card">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold" style={{ fontSize: 14 }}>{booking.train?.trainNumber}</span>
                    <span className="font-bold" style={{ fontSize: 15 }}>{booking.train?.trainName}</span>
                  </div>
                  <div className="text-sm text-secondary">
                    {booking.train?.departureTime} → {booking.train?.arrivalTime}
                  </div>
                </div>
                {statusBadge(booking.status)}
              </div>

              {/* Details grid */}
              <div className="grid-4" style={{ marginBottom: 16 }}>
                {[
                  { label: 'PNR', val: booking.pnr, mono: true },
                  { label: 'Route', val: `${booking.source} → ${booking.destination}` },
                  { label: 'Class', val: booking.travelClass },
                  { label: 'Passengers', val: `${booking.passengers?.length} passenger${booking.passengers?.length !== 1 ? 's' : ''}` },
                ].map(({ label, val, mono }) => (
                  <div key={label}>
                    <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                    <div className={`font-semibold ${mono ? 'font-mono' : ''}`} style={{ fontSize: 13 }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Passengers */}
              {booking.passengers?.length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                  {booking.passengers.map((p, i) => (
                    <div key={i} className="flex justify-between" style={{ fontSize: 13, padding: '4px 0', borderBottom: i < booking.passengers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-secondary">{p.age}y · {p.gender} · {p.berthPreference}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center" style={{ paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--orange)', fontSize: 17 }}>₹{booking.totalFare}</span>
                  <span className="text-xs text-muted ml-2">
                    Booked {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/pnr?pnr=${booking.pnr}`)}>
                    Check PNR
                  </button>
                  {booking.status === 'Confirmed' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {booking.status === 'Cancelled' && (
                    <span className="badge badge-danger">Refund Initiated</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
