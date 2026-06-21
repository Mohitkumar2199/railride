import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchTrains } from '../utils/api'
import toast from 'react-hot-toast'

const CLASS_COLORS = { '1A':'#7c3aed','2A':'#1d4ed8','3A':'#0369a1','SL':'#15803d','CC':'#b45309','EC':'#9333ea','2S':'#6b7280' }
const STATUS_COLORS = { AVL:'#16a34a', WL:'#d97706', RAC:'#2563eb' }
const TRAIN_TYPES = ['Rajdhani','Shatabdi','Vande Bharat','Superfast','Express','Duronto','Local']
const CLASSES = ['SL','3A','2A','1A','CC','EC','2S']

function SkeletonCard() {
  return (
    <div className="skeleton-card skeleton">
      <div className="skeleton-line" style={{ height: 16, width: '40%' }} />
      <div className="skeleton-line" style={{ height: 40, marginTop: 16 }} />
      <div className="skeleton-line" style={{ height: 14, width: '60%' }} />
    </div>
  )
}

export default function SearchResults() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    class: params.get('class') || 'All Classes',
    types: [], amenities: [],
    depFrom: '', depTo: '', arrFrom: '', arrTo: ''
  })
  const [viewMode, setViewMode] = useState('cards')

  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const date = params.get('date') || ''

 useEffect(() => {
  if (!from || !to) {
    setLoading(false)
    setTrains([])
    setError('')
    return
  }
  setLoading(true); setError('')
  searchTrains({ from, to, date, travelClass: filters.class !== 'All Classes' ? filters.class : '', type: '' })
    .then(({ data }) => { setTrains(data); setLoading(false) })
    .catch(() => { setError('Failed to fetch trains. Please check your connection.'); setLoading(false) })
}, [from, to, date, filters.class])
  const displayed = trains.filter(t => filters.types.length === 0 || filters.types.includes(t.trainType))

  const handleBook = (train, cls) => {
    if (cls.availableSeats === 0 && cls.status === 'WL') return toast.error('No confirmed seats available in this class')
    navigate(`/book/${train._id}?class=${cls.type}&date=${date}`)
  }

  const classColor = (type) => CLASS_COLORS[type] || '#374151'
  const statusColor = (s) => STATUS_COLORS[s] || '#94a3b8'
  const statusLabel = (cls) => {
    if (cls.availableSeats > 0) return `Avl ${cls.availableSeats}`
    return cls.status === 'WL' ? `WL ${Math.abs(cls.waitlistCount || 5)}` : `RAC ${cls.racCount || 4}`
  }

  return (
    <div className="page">
      {/* Inline search bar at top */}
      <div className="search-section" style={{ paddingBottom: 0 }}>
        <div className="search-panel" style={{ padding: '16px 24px' }}>
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">From</label>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{from || '—'}</div>
            </div>
            <div style={{ fontSize: 20, color: 'var(--orange)' }}>→</div>
            <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">To</label>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{to || '—'}</div>
            </div>
            {date && <div className="form-field"><label className="form-label">Date</label><div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(date + 'T00:00:00').toDateString()}</div></div>}
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Modify Search</button>
          </div>
        </div>
      </div>

      <div className="results-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar__title">Filters</div>

          <div className="filter-section">
            <div className="filter-label">Departure Time</div>
            <div className="time-range">
              <input type="time" className="time-input" value={filters.depFrom} onChange={e => setFilters(f => ({ ...f, depFrom: e.target.value }))} />
              <span className="text-muted">–</span>
              <input type="time" className="time-input" value={filters.depTo} onChange={e => setFilters(f => ({ ...f, depTo: e.target.value }))} />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Arrival Time</div>
            <div className="time-range">
              <input type="time" className="time-input" value={filters.arrFrom} onChange={e => setFilters(f => ({ ...f, arrFrom: e.target.value }))} />
              <span className="text-muted">–</span>
              <input type="time" className="time-input" value={filters.arrTo} onChange={e => setFilters(f => ({ ...f, arrTo: e.target.value }))} />
            </div>
          </div>

          <div className="filter-divider" />
          <div className="filter-section">
            <div className="filter-label">Class</div>
            {['All Classes', ...CLASSES].map(c => (
              <label key={c} className="filter-row">
                <input type="radio" name="class" checked={filters.class === c} onChange={() => setFilters(f => ({ ...f, class: c }))} />
                <span>{c}</span>
              </label>
            ))}
          </div>

          <div className="filter-divider" />
          <div className="filter-section">
            <div className="filter-label">Train Type</div>
            {TRAIN_TYPES.map(t => (
              <label key={t} className="filter-row">
                <input type="checkbox" checked={filters.types.includes(t)} onChange={e => setFilters(f => ({ ...f, types: e.target.checked ? [...f.types, t] : f.types.filter(x => x !== t) }))} />
                <span>{t}</span>
              </label>
            ))}
          </div>

          <div className="filter-divider" />
          <div className="filter-section">
            <div className="filter-label">Amenities</div>
            {['Pantry Car','Bedroll','WiFi','Charging Point'].map(a => (
              <label key={a} className="filter-row">
                <input type="checkbox" checked={filters.amenities.includes(a)} onChange={e => setFilters(f => ({ ...f, amenities: e.target.checked ? [...f.amenities, a] : f.amenities.filter(x => x !== a) }))} />
                <span>{a}</span>
              </label>
            ))}
          </div>

          <button className="btn btn-outline btn-full btn-sm mt-2" onClick={() => setFilters({ class: 'All Classes', types: [], amenities: [], depFrom: '', depTo: '', arrFrom: '', arrTo: '' })}>
            Clear All Filters
          </button>
        </aside>

        {/* MAIN */}
        <main>
          <div className="results-header">
            <div>
              <div className="results-title">{from} to {to}</div>
              <div className="results-subtitle">
                {date ? new Date(date + 'T00:00:00').toDateString() : 'Any date'} • {displayed.length} train{displayed.length !== 1 ? 's' : ''} found
              </div>
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>Summary Cards</button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List View</button>
            </div>
          </div>

          {/* #20 - Error boundary display */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* #12 - Skeleton loading */}
          {loading && [1,2,3].map(i => <SkeletonCard key={i} />)}

          {!loading && !error && !from && !to && (
  <div className="card empty-state">
    <div className="empty-state__icon">🔍</div>
    <div className="empty-state__title">Search for trains</div>
    <div className="empty-state__text">Enter a from and to station to see available trains</div>
    <button className="btn btn-primary" onClick={() => navigate('/')}>New Search</button>
  </div>
)}

{!loading && !error && (from || to) && displayed.length === 0 && (
  <div className="card empty-state">
    <div className="empty-state__icon">🚂</div>
    <div className="empty-state__title">No trains found</div>
    <div className="empty-state__text">Try different cities, date, or remove filters</div>
    <button className="btn btn-primary" onClick={() => navigate('/')}>New Search</button>
  </div>
)}

          {!loading && displayed.map(train => (
            <div key={train._id} className="train-card">
              <div className="train-card__inner">
                {/* LEFT */}
                <div className="train-card__left">
                  <div className="train-card__toprow">
                    <span className="train-card__num">{train.trainNumber}</span>
                    <span className="train-card__name">{train.trainName}</span>
                    <span className="train-card__days">({train.daysOfOperation?.join(', ') || 'Daily'})</span>
                  </div>

                  <div className="journey-row">
                    <div>
                      <div className="journey-time">{train.departureTime}</div>
                      <div className="journey-station">{train.sourceCode}</div>
                    </div>
                    <div className="journey-mid">
                      <div className="journey-line">
                        <div className="journey-dot" />
                        <div className="journey-dash" />
                        <span className="journey-arrow">→ {train.duration}</span>
                        <div className="journey-dash" />
                        <div className="journey-dot" />
                      </div>
                      <div className="journey-duration">{train.totalDistance} km</div>
                    </div>
                    <div className="journey-right">
                      <div className="journey-time">{train.arrivalTime}</div>
                      <div className="journey-station">{train.destinationCode}</div>
                    </div>
                  </div>

                  <div className="train-meta">
                    <span className="meta-tag">🚆 {train.trainType}</span>
                    {(train.amenities || []).map(a => <span key={a} className="meta-tag">{a}</span>)}
                  </div>
                  <span className="detail-link">Details, Classes, {train.classes?.[0]?.type}</span>
                </div>

                {/* RIGHT */}
                <div className="train-card__right">
                  <div className="avail-title">Availability</div>
                  {train.classes?.map(cls => (
                    <div key={cls.type} className="avail-row">
                      <span className="class-tag" style={{ background: classColor(cls.type) + '18', color: classColor(cls.type) }}>{cls.type}</span>
                      <div className="avail-info">
                        <span className="avail-count" style={{ color: statusColor(cls.availableSeats > 0 ? 'AVL' : 'WL') }}>
                          {statusLabel(cls)}
                        </span>
                        <span className="avail-sep">-</span>
                        <span className="avail-fare">₹{cls.fare}</span>
                      </div>
                    </div>
                  ))}
                  <button className="book-btn" onClick={() => handleBook(train, train.classes?.[0] || {})}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
