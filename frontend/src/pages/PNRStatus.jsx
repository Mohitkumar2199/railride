import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getByPNR } from '../utils/api'
import toast from 'react-hot-toast'

export default function PNRStatus() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [pnr, setPnr] = useState(searchParams.get('pnr') || '')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('pnr')) check(searchParams.get('pnr'))
  }, [])

  const check = async (num) => {
    const p = (num || pnr).trim()
    if (!p || p.length !== 10) { setError('Please enter a valid 10-digit PNR number'); return }
    setLoading(true); setError(''); setBooking(null)
    try {
      const { data } = await getByPNR(p)
      setBooking(data)
    } catch {
      setError('PNR not found. Please check the number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    Confirmed: { badge: 'badge-success', label: '✓ Confirmed' },
    Cancelled:  { badge: 'badge-danger',  label: '✕ Cancelled' },
    Waitlist:   { badge: 'badge-warning', label: '⏳ Waitlist' },
    RAC:        { badge: 'badge-blue',    label: '↗ RAC' },
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 24px' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>PNR Status</h2>
          <p className="text-muted text-sm mt-1">Check your booking status and seat details</p>
        </div>

        {/* Search */}
        <div className="card mb-4">
          <div className="card-title">Enter PNR Number</div>
          <div className="flex gap-3">
            <input
              className="form-input"
              style={{ flex: 1, fontSize: 16, letterSpacing: 2, fontFamily: 'monospace' }}
              placeholder="10-digit PNR"
              value={pnr}
              onChange={e => { setPnr(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); setBooking(null) }}
              onKeyDown={e => e.key === 'Enter' && check()}
              maxLength={10}
            />
            <button className="btn btn-primary" onClick={() => check()} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Checking...</> : '🔍 Check Status'}
            </button>
          </div>
          {error && <div className="alert alert-error mt-3">{error}</div>}
        </div>

        {/* Result */}
        {booking && (() => {
          const cfg = statusConfig[booking.status] || { badge: 'badge-blue', label: booking.status }
          return (
            <div className="card">
              {/* PNR + Status */}
              <div className="text-center" style={{ paddingBottom: 20, borderBottom: '1.5px solid var(--border)' }}>
                <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>PNR Number</div>
                <div className="pnr-num">{booking.pnr}</div>
                <div className="mt-3">
                  <span className={`badge ${cfg.badge}`} style={{ fontSize: 13, padding: '5px 16px' }}>{cfg.label}</span>
                </div>
                {booking.paymentStatus === 'Refunded' && (
                  <div className="text-xs text-muted mt-2">Refund has been initiated</div>
                )}
              </div>

              {/* Train Info */}
              <div style={{ padding: '16px 0', borderBottom: '1.5px solid var(--border)' }}>
                <div className="card-title" style={{ marginBottom: 12 }}>Train Details</div>
                <div className="grid-2">
                  {[
                    { label: 'Train', val: booking.train?.trainName },
                    { label: 'Train No.', val: `#${booking.train?.trainNumber}`, mono: true },
                    { label: 'From', val: booking.source },
                    { label: 'To', val: booking.destination },
                    { label: 'Departure', val: booking.train?.departureTime },
                    { label: 'Arrival', val: booking.train?.arrivalTime },
                    { label: 'Class', val: booking.travelClass },
                    { label: 'Journey Date', val: booking.journeyDate ? new Date(booking.journeyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  ].map(({ label, val, mono }) => (
                    <div key={label}>
                      <div className="text-xs text-muted" style={{ marginBottom: 3 }}>{label}</div>
                      <div className={`font-semibold ${mono ? 'font-mono' : ''}`} style={{ fontSize: 14 }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passengers */}
              {booking.passengers?.length > 0 && (
                <div style={{ padding: '16px 0', borderBottom: '1.5px solid var(--border)' }}>
                  <div className="card-title" style={{ marginBottom: 12 }}>Passenger Details</div>
                  {booking.passengers.map((p, i) => (
                    <div key={i} className="flex justify-between items-center"
                      style={{ padding: '9px 0', borderBottom: i < booking.passengers.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14 }}>
                      <div>
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-secondary text-sm ml-2">{p.age}y · {p.gender}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted">{p.berthPreference}</div>
                        {p.seatNumber && <div className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>Seat {p.seatNumber}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fare */}
              <div className="flex justify-between items-center" style={{ paddingTop: 16 }}>
                <span className="text-secondary text-sm">Total Fare</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--orange)' }}>₹{booking.totalFare}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/bookings')}>View All Bookings</button>
                <button className="btn btn-primary btn-sm" onClick={() => { setPnr(''); setBooking(null) }}>Check Another PNR</button>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
