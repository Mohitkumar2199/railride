import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTrains, createTrain, updateTrain, deleteTrain } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const TRAIN_TYPES = ['Express','Superfast','Rajdhani','Shatabdi','Vande Bharat','Duronto','Local']
const CLASS_TYPES = ['SL','3A','2A','1A','CC','EC','2S']

const emptyForm = {
  trainNumber: '', trainName: '', source: '', sourceCode: '',
  destination: '', destinationCode: '', departureTime: '', arrivalTime: '',
  duration: '', totalDistance: '', trainType: 'Express', daysOfOperation: [],
  classes: [{ type: 'SL', totalSeats: 400, availableSeats: 400, fare: 500 }]
}

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, routes: 0 })

  useEffect(() => {
    if (!user || user.role !== 'admin') { toast.error('Admin access required'); navigate('/'); return }
    loadTrains()
  }, [])

  const loadTrains = () => {
    setLoading(true)
    getAllTrains()
      .then(({ data }) => {
        setTrains(data)
        const routes = new Set(data.map(t => `${t.sourceCode}-${t.destinationCode}`))
        setStats({ total: data.length, active: data.filter(t => t.isActive).length, routes: routes.size })
      })
      .catch(() => toast.error('Failed to load trains'))
      .finally(() => setLoading(false))
  }

  const toggleDay = (day) => setForm(f => ({
    ...f,
    daysOfOperation: f.daysOfOperation.includes(day)
      ? f.daysOfOperation.filter(d => d !== day)
      : [...f.daysOfOperation, day]
  }))

  const updateClass = (i, field, val) => {
    const updated = [...form.classes]
    updated[i] = { ...updated[i], [field]: field === 'type' ? val : Number(val) }
    setForm(f => ({ ...f, classes: updated }))
  }

  const addClass = () => setForm(f => ({
    ...f,
    classes: [...f.classes, { type: 'SL', totalSeats: 400, availableSeats: 400, fare: 500 }]
  }))

  const removeClass = (i) => setForm(f => ({ ...f, classes: f.classes.filter((_, j) => j !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.trainNumber || !form.trainName || !form.source || !form.destination)
      return toast.error('Please fill all required fields')
    if (form.daysOfOperation.length === 0)
      return toast.error('Select at least one day of operation')
    if (form.classes.length === 0)
      return toast.error('Add at least one travel class')

    setSubmitting(true)
    try {
      const payload = { ...form, totalDistance: Number(form.totalDistance) }
      if (editId) {
        const { data } = await updateTrain(editId, payload)
        setTrains(prev => prev.map(t => t._id === editId ? data : t))
        toast.success('Train updated successfully')
      } else {
        const { data } = await createTrain(payload)
        setTrains(prev => [...prev, data])
        toast.success(`Train ${data.trainNumber} created!`)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditId(null)
      loadTrains()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save train')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (train) => {
    setForm({ ...train, totalDistance: train.totalDistance?.toString() || '' })
    setEditId(train._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (train) => {
    if (!window.confirm(`Delete "${train.trainName}" (${train.trainNumber})?`)) return
    try {
      await deleteTrain(train._id)
      setTrains(prev => prev.filter(t => t._id !== train._id))
      toast.success('Train deleted')
      loadTrains()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = trains.filter(t =>
    !search || t.trainName.toLowerCase().includes(search.toLowerCase()) ||
    t.trainNumber.includes(search) || t.sourceCode.includes(search.toUpperCase()) ||
    t.destinationCode.includes(search.toUpperCase())
  )

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>Admin Panel</h2>
            <p className="text-muted text-sm mt-1">Manage trains, routes and schedules</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}>
            {showForm ? '× Close Form' : '+ Add Train'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid-3 mb-6">
          {[
            { label: 'Total Trains', val: stats.total, icon: '🚂' },
            { label: 'Active Trains', val: stats.active, icon: '✅' },
            { label: 'Unique Routes', val: stats.routes, icon: '🗺️' },
          ].map(s => (
            <div key={s.label} className="card text-center" style={{ padding: '20px 16px', marginBottom: 0 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>{s.val}</div>
              <div className="text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="card mb-6" style={{ border: '2px solid var(--orange)' }}>
            <div className="card-title">{editId ? '✏️ Edit Train' : '➕ Add New Train'}</div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2 mb-4">
                <div className="form-field">
                  <label className="form-label">Train Number *</label>
                  <input className="form-input font-mono" placeholder="12952" value={form.trainNumber} onChange={e => setForm(f => ({ ...f, trainNumber: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Train Name *</label>
                  <input className="form-input" placeholder="Rajdhani Express" value={form.trainName} onChange={e => setForm(f => ({ ...f, trainName: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Source City *</label>
                  <input className="form-input" placeholder="New Delhi" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Source Code *</label>
                  <input className="form-input font-mono" placeholder="NDLS" value={form.sourceCode} onChange={e => setForm(f => ({ ...f, sourceCode: e.target.value.toUpperCase() }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Destination City *</label>
                  <input className="form-input" placeholder="Mumbai Central" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Destination Code *</label>
                  <input className="form-input font-mono" placeholder="MMCT" value={form.destinationCode} onChange={e => setForm(f => ({ ...f, destinationCode: e.target.value.toUpperCase() }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Departure Time *</label>
                  <input className="form-input" type="time" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Arrival Time *</label>
                  <input className="form-input" type="time" value={form.arrivalTime} onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="15h 40m" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Distance (km)</label>
                  <input className="form-input" type="number" placeholder="1384" value={form.totalDistance} onChange={e => setForm(f => ({ ...f, totalDistance: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Train Type</label>
                  <select className="form-select" value={form.trainType} onChange={e => setForm(f => ({ ...f, trainType: e.target.value }))}>
                    {TRAIN_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Days */}
              <div style={{ marginBottom: 20 }}>
                <div className="form-label mb-2">Days of Operation *</div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        background: form.daysOfOperation.includes(day) ? 'var(--navy)' : 'white',
                        color: form.daysOfOperation.includes(day) ? 'white' : 'var(--text-secondary)',
                        borderColor: form.daysOfOperation.includes(day) ? 'var(--navy)' : 'var(--border)' }}>
                      {day}
                    </button>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, daysOfOperation: [...DAYS] }))}>All Days</button>
                </div>
              </div>

              {/* Classes */}
              <div style={{ marginBottom: 20 }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="form-label">Travel Classes *</div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addClass}>+ Add Class</button>
                </div>
                <div style={{ border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 40px', gap: 0, background: '#f8fafc', padding: '8px 12px', borderBottom: '1.5px solid var(--border)' }}>
                    {['Class','Total Seats','Avail. Seats','Fare (₹)',''].map(h => (
                      <div key={h} className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                    ))}
                  </div>
                  {form.classes.map((cls, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 40px', gap: 8, padding: '10px 12px', borderBottom: i < form.classes.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                      <select className="form-select" style={{ padding: '7px 10px', fontSize: 13 }} value={cls.type} onChange={e => updateClass(i, 'type', e.target.value)}>
                        {CLASS_TYPES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <input className="form-input" type="number" style={{ padding: '7px 10px', fontSize: 13 }} value={cls.totalSeats} onChange={e => updateClass(i, 'totalSeats', e.target.value)} />
                      <input className="form-input" type="number" style={{ padding: '7px 10px', fontSize: 13 }} value={cls.availableSeats} onChange={e => updateClass(i, 'availableSeats', e.target.value)} />
                      <input className="form-input" type="number" style={{ padding: '7px 10px', fontSize: 13 }} value={cls.fare} onChange={e => updateClass(i, 'fare', e.target.value)} />
                      <button type="button" onClick={() => removeClass(i)} style={{ color: 'var(--danger)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editId ? '✓ Update Train' : '+ Create Train'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null) }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Train List */}
        <div className="card" style={{ padding: 0 }}>
          <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border)' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>All Trains ({filtered.length})</div>
            <input
              className="form-input" style={{ width: 240, padding: '8px 12px', fontSize: 14 }}
              placeholder="Search by name, number, station..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['No.','Train Name','Route','Timings','Duration','Type','Classes','Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 40 }}>No trains found</td></tr>
                )}
                {filtered.map(train => (
                  <tr key={train._id}>
                    <td className="font-mono font-bold" style={{ color: 'var(--navy)' }}>{train.trainNumber}</td>
                    <td className="font-semibold">{train.trainName}</td>
                    <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                      <span className="font-semibold">{train.sourceCode}</span> → <span className="font-semibold">{train.destinationCode}</span>
                    </td>
                    <td className="font-mono" style={{ fontSize: 13 }}>{train.departureTime} – {train.arrivalTime}</td>
                    <td className="text-secondary" style={{ fontSize: 13 }}>{train.duration}</td>
                    <td><span className="badge badge-blue">{train.trainType}</span></td>
                    <td style={{ fontSize: 12 }}>{train.classes?.map(c => c.type).join(', ')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(train)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(train)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
