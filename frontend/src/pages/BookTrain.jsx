import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getTrainById, createBooking, aiRecommendSeat } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CLASS_COLORS = { '1A':'#7c3aed','2A':'#1d4ed8','3A':'#0369a1','SL':'#15803d','CC':'#b45309','EC':'#9333ea','2S':'#6b7280' }

export default function BookTrain() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const travelClass = searchParams.get('class')
  const date = searchParams.get('date')

  const [train, setTrain] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [selectedClass, setSelectedClass] = useState(null)
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male', berthPreference: 'No Preference' }])
  const [confirmedPNR, setConfirmedPNR] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [aiRec, setAiRec] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  // Mock payment state
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [paymentDone, setPaymentDone] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getTrainById(id)
      .then(({ data }) => {
        setTrain(data)
        const cls = data.classes?.find(c => c.type === travelClass) || data.classes?.[0]
        setSelectedClass(cls)
        setLoading(false)
      })
      .catch(() => { toast.error('Train not found'); navigate('/'); })
  }, [id])

  const totalFare = selectedClass ? selectedClass.fare * passengers.length : 0

  const updatePassenger = (i, field, val) => {
    const updated = [...passengers]
    updated[i] = { ...updated[i], [field]: val }
    setPassengers(updated)
  }

  const validatePassengers = () => {
    for (const p of passengers) {
      if (!p.name.trim() || p.name.trim().length < 2) { toast.error('Enter valid name for all passengers'); return false }
      if (!p.age || p.age < 1 || p.age > 120) { toast.error('Enter valid age for all passengers'); return false }
    }
    return true
  }

  const handleAiSeat = async () => {
    if (!train) return
    setAiLoading(true); setAiRec(null)
    try {
      const hrs = parseInt(train.duration) || 12
      const { data } = await aiRecommendSeat({
        journeyHours: hrs,
        budget: selectedClass?.fare || 800,
        travelPurpose: 'general travel',
        groupSize: passengers.length,
        availableClasses: train.classes?.map(c => `${c.type} ₹${c.fare} (${c.availableSeats} seats)`).join(', '),
      })
      setAiRec(data)
      toast.success('AI recommendation ready!')
    } catch { toast.error('AI advisor unavailable') }
    finally { setAiLoading(false) }
  }

  const handleConfirmBooking = async () => {
    if (!validatePassengers()) return
    setSubmitting(true)
    try {
      const { data } = await createBooking({
        trainId: id,
        journeyDate: date || new Date().toISOString(),
        source: train.source,
        destination: train.destination,
        travelClass: selectedClass.type,
        passengers,
      })
      setConfirmedPNR(data.pnr)
      setStep(4)
      toast.success('Booking confirmed! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>

  const stepStatus = (n) => step === n ? 'active' : step > n ? 'done' : 'pending'

  return (
    <div className="page">
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 24px' }}>
        {/* Steps */}
        <div className="steps">
          {[['1','Select Class'],['2','Passengers'],['3','Payment'],['4','Confirmed']].map(([n, label], i) => (
            <div key={n} className="flex items-center gap-2">
              <div className="step">
                <div className={`step__num step__num--${stepStatus(i+1)}`}>{step > i+1 ? '✓' : n}</div>
                <span className={`step__label step__label--${stepStatus(i+1)}`}>{label}</span>
              </div>
              {i < 3 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Train Summary */}
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-mono font-bold">{train.trainNumber}</span>
              <span className="font-bold ml-2">{train.trainName}</span>
              <div className="text-sm text-secondary mt-1">
                {train.source} → {train.destination} • {train.departureTime} → {train.arrivalTime} • {train.duration}
              </div>
            </div>
            <div className="text-right">
              {selectedClass && <span className="badge badge-blue">{selectedClass.type}</span>}
              {date && <div className="text-xs text-muted mt-1">{new Date(date + 'T00:00:00').toDateString()}</div>}
            </div>
          </div>
        </div>

        {/* STEP 1 — Class Selection */}
        {step === 1 && (
          <>
            <div className="card">
              <div className="card-title">Select Travel Class</div>
              <div className="class-grid">
                {train.classes?.map(cls => (
                  <div key={cls.type} className={`class-pill ${selectedClass?.type === cls.type ? 'selected' : ''}`}
                    onClick={() => setSelectedClass(cls)}>
                    <div className="class-pill__type" style={{ color: CLASS_COLORS[cls.type] }}>{cls.type}</div>
                    <div className="class-pill__seats">{cls.availableSeats} seats avail</div>
                    <div className="class-pill__fare">₹{cls.fare}</div>
                    <div className="class-pill__status" style={{ color: cls.availableSeats > 0 ? '#16a34a' : '#d97706' }}>
                      {cls.availableSeats > 0 ? 'AVAILABLE' : 'WAITLIST'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Seat Advisor */}
            <div className="ai-advisor">
              <div className="ai-advisor__header">
                <div>
                  <div className="ai-advisor__title">✨ AI Seat Advisor</div>
                  <div className="ai-advisor__sub">Get a class recommendation for your journey</div>
                </div>
                <button className="btn btn-indigo btn-sm" onClick={handleAiSeat} disabled={aiLoading}>
                  {aiLoading ? 'Analysing...' : 'Recommend Class'}
                </button>
              </div>
              {aiRec && (
                <div className="ai-advisor__result">
                  <div className="ai-advisor__class-badge">{aiRec.recommended}</div>
                  <div>
                    <div className="font-semibold" style={{ color: '#15803d', marginBottom: 6 }}>Recommended for your trip</div>
                    <div className="ai-advisor__reason">{aiRec.reason}</div>
                    <div className="ai-advisor__tips">
                      {aiRec.tips?.map((tip, i) => <div key={i} className="ai-advisor__tip">• {tip}</div>)}
                    </div>
                    {aiRec.alternative && <div className="text-xs text-muted mt-2">Alternative: <strong>{aiRec.alternative}</strong></div>}
                  </div>
                </div>
              )}
            </div>

            {/* Passenger count */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Number of Passengers</span>
                <div className="flex items-center gap-3">
                  <button className="btn btn-outline btn-sm" onClick={() => passengers.length > 1 && setPassengers(p => p.slice(0, -1))}>−</button>
                  <span className="font-bold">{passengers.length}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => passengers.length < 6 && setPassengers(p => [...p, { name: '', age: '', gender: 'Male', berthPreference: 'No Preference' }])}>+</button>
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--orange-bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary text-sm">{passengers.length} passenger{passengers.length > 1 ? 's' : ''} × ₹{selectedClass?.fare || 0}</span>
                <span style={{ color: 'var(--orange)', fontWeight: 800, fontSize: 18 }}>₹{totalFare}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={() => { if (!selectedClass) { toast.error('Please select a class first'); return } setStep(2) }}>
                Continue to Passengers →
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Passengers */}
        {step === 2 && (
          <>
            <div className="card">
              <div className="card-title">Passenger Details</div>
              {passengers.map((p, i) => (
                <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 14 }}>
                  <div style={{ color: 'var(--orange)', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Passenger {i + 1}</div>
                  <div className="grid-2">
                    <div className="form-field">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" placeholder="As per ID proof" value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Age</label>
                      <input className="form-input" type="number" placeholder="25" min="1" max="120" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Berth Preference</label>
                      <select className="form-select" value={p.berthPreference} onChange={e => updatePassenger(i, 'berthPreference', e.target.value)}>
                        {['Lower','Middle','Upper','Side Lower','Side Upper','No Preference'].map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <div className="flex items-center gap-3">
                <span style={{ fontWeight: 700, color: 'var(--orange)', fontSize: 16 }}>Total: ₹{totalFare}</span>
                <button className="btn btn-primary" onClick={() => { if (validatePassengers()) setStep(3) }}>
                  Proceed to Payment →
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3 — Mock Payment (#7) */}
        {step === 3 && (
          <>
            <div className="card">
              <div className="card-title">Payment</div>
              <div style={{ padding: '14px 16px', background: 'var(--orange-bg)', borderRadius: 8, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Amount to pay</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--orange)' }}>₹{totalFare}</span>
              </div>

              <div className="card-title" style={{ fontSize: 14 }}>Choose Payment Method</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[['upi','📱 UPI (GPay / PhonePe / Paytm)'],['card','💳 Debit / Credit Card'],['netbanking','🏦 Net Banking'],['wallet','👜 Wallet']].map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1.5px solid ${paymentMethod === val ? 'var(--orange)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', background: paymentMethod === val ? 'var(--orange-bg)' : 'white' }}>
                    <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                    <span style={{ fontSize: 14, fontWeight: paymentMethod === val ? 600 : 400 }}>{label}</span>
                  </label>
                ))}
              </div>

              {!paymentDone ? (
                <button className="btn btn-primary btn-full" onClick={() => {
                  toast.loading('Processing payment...', { duration: 1500 })
                  setTimeout(() => { setPaymentDone(true); toast.success('Payment successful! ₹' + totalFare) }, 1500)
                }}>
                  💳 Pay ₹{totalFare} Now
                </button>
              ) : (
                <div>
                  <div className="alert alert-success mb-4">✅ Payment of ₹{totalFare} successful via {paymentMethod.toUpperCase()}</div>
                  <button className="btn btn-primary btn-full" onClick={handleConfirmBooking} disabled={submitting}>
                    {submitting ? 'Confirming booking...' : '🎫 Confirm Booking →'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
            </div>
          </>
        )}

        {/* STEP 4 — Confirmation */}
        {step === 4 && (
          <div className="card text-center" style={{ padding: '48px 32px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#15803d' }}>Booking Confirmed!</h2>
            <p className="text-muted mt-2">Your ticket has been booked and payment received.</p>
            <div style={{ margin: '24px auto', padding: '20px 40px', background: 'var(--success-light)', borderRadius: 12, display: 'inline-block' }}>
              <div className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>PNR Number</div>
              <div className="pnr-num">{confirmedPNR}</div>
            </div>
            <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
              <div>🚂 {train.trainName} ({train.trainNumber})</div>
              <div className="mt-1">{train.source} → {train.destination} • Class: {selectedClass?.type}</div>
              <div className="mt-1">Passengers: {passengers.length} • Total: ₹{totalFare}</div>
            </div>
            <div className="flex gap-3 justify-center">
              <button className="btn btn-outline" onClick={() => navigate('/bookings')}>View My Bookings</button>
              <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
